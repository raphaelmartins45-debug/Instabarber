import { z } from "zod";
import type { ContaNova, Custo } from "@/lib/financas/custos";
import type { BarbeariaFin, RecebimentoFin } from "@/lib/financas/indicadores";
import { hojeIso } from "@/lib/formatacao/datas";
import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { ContaValidada, CustoValidado } from "@/lib/validacao/financas";
import { falhaDeLeitura } from "./erros";

// Finanças da Performa LAB (O.4). Só o super_admin com dois fatores lê e escreve (RLS); o
// estado das contas calcula-se ao ler, na vista contas_pagar_com_estado (D-16).

const uuid = z.string().uuid();

export type CustoLinha = Custo & { id: string; nota: string };
export type Conta = {
  id: string;
  custoId: string | null;
  fornecedor: string;
  descricao: string;
  semIvaCent: number;
  comIvaCent: number;
  vencimento: string;
  pagoEm: string | null;
  estado: "pendente" | "atrasada" | "paga";
  nota: string;
};

export async function listarCustos(bd: ClienteBD): Promise<CustoLinha[]> {
  const { data, error } = await bd
    .from("custos_plataforma")
    .select("*")
    .order("ativo", { ascending: false })
    .order("data_inicio", { ascending: false });
  if (error) falhaDeLeitura("custos_plataforma", error);
  return data.map((c) => ({
    id: c.id,
    descricao: c.descricao,
    categoria: c.categoria as Custo["categoria"],
    tipo: c.tipo as Custo["tipo"],
    valorSemIvaCent: centimosDeNumeric(c.valor_sem_iva),
    periodicidade: c.periodicidade as Custo["periodicidade"],
    dataInicio: c.data_inicio,
    dataFim: c.data_fim,
    ativo: c.ativo,
    nota: c.nota ?? "",
  }));
}

const linhaCusto = (c: CustoValidado) => ({
  descricao: c.descricao,
  categoria: c.categoria,
  tipo: c.tipo,
  valor_sem_iva: numericParaGravar(c.valor_sem_iva),
  periodicidade: c.periodicidade,
  data_inicio: c.data_inicio,
  data_fim: c.data_fim || null,
  nota: c.nota || null,
});

export async function criarCustos(bd: ClienteBD, custos: CustoValidado[]): Promise<boolean> {
  const { error } = await bd.from("custos_plataforma").insert(custos.map(linhaCusto));
  return !error;
}

export async function atualizarCusto(bd: ClienteBD, id: string, c: CustoValidado) {
  const { error } = await bd
    .from("custos_plataforma")
    .update(linhaCusto(c))
    .eq("id", uuid.parse(id));
  return !error;
}

/** Dar fim a um custo (por exemplo, a Vercel Hobby quando passa a Pro): fica no histórico. */
export async function terminarCusto(bd: ClienteBD, id: string, fim: string) {
  const { error } = await bd
    .from("custos_plataforma")
    .update({ data_fim: fim, ativo: false })
    .eq("id", uuid.parse(id))
    .lte("data_inicio", fim);
  return !error;
}

export async function apagarCusto(bd: ClienteBD, id: string) {
  const { error } = await bd.from("custos_plataforma").delete().eq("id", uuid.parse(id));
  return !error;
}

export async function listarContas(bd: ClienteBD): Promise<Conta[]> {
  const { data, error } = await bd
    .from("contas_pagar_com_estado")
    .select("*")
    .order("vencimento", { ascending: true });
  if (error) falhaDeLeitura("contas_pagar", error);
  return data.map((c) => ({
    id: c.id!,
    custoId: c.custo_id,
    fornecedor: c.fornecedor!,
    descricao: c.descricao ?? "",
    semIvaCent: centimosDeNumeric(c.valor_sem_iva!),
    comIvaCent: centimosDeNumeric(c.valor_com_iva!),
    vencimento: c.vencimento!,
    pagoEm: c.pago_em,
    estado: c.estado_efetivo as Conta["estado"],
    nota: c.nota ?? "",
  }));
}

const linhaConta = (c: ContaValidada) => ({
  fornecedor: c.fornecedor,
  descricao: c.descricao || null,
  valor_sem_iva: numericParaGravar(c.valor_sem_iva),
  valor_com_iva: numericParaGravar(c.valor_com_iva),
  vencimento: c.vencimento,
  nota: c.nota || null,
});

export async function criarConta(bd: ClienteBD, c: ContaValidada) {
  const { error } = await bd.from("contas_pagar").insert(linhaConta(c));
  return !error;
}

export async function atualizarConta(bd: ClienteBD, id: string, c: ContaValidada) {
  const { error } = await bd.from("contas_pagar").update(linhaConta(c)).eq("id", uuid.parse(id));
  return !error;
}

export async function marcarContaPaga(bd: ClienteBD, id: string, em: string) {
  const { error } = await bd
    .from("contas_pagar")
    .update({ pago_em: em })
    .eq("id", uuid.parse(id))
    .is("pago_em", null);
  return !error;
}

export async function apagarConta(bd: ClienteBD, id: string) {
  const { error } = await bd.from("contas_pagar").delete().eq("id", uuid.parse(id));
  return !error;
}

export async function inserirContasGeradas(bd: ClienteBD, contas: ContaNova[]) {
  if (!contas.length) return true;
  const { error } = await bd.from("contas_pagar").insert(
    contas.map((c) => ({
      custo_id: c.custoId,
      fornecedor: c.fornecedor,
      descricao: c.descricao,
      valor_sem_iva: numericParaGravar(c.valorSemIvaCent),
      valor_com_iva: numericParaGravar(c.valorComIvaCent),
      vencimento: c.vencimento,
    })),
  );
  return !error;
}

/**
 * Barbearias para as Finanças, com o dia da última mudança de estado das canceladas (a
 * auditoria regista que o estado mudou; numa cancelada, a última mudança é a saída).
 */
export async function barbeariasParaFinancas(
  bd: ClienteBD,
): Promise<(BarbeariaFin & { nome: string })[]> {
  const { data, error } = await bd
    .from("inquilinos")
    .select(
      "id, nome, plano, periodicidade, profissionais_contratados, dominio_proprio, estado, estado_pagamento, aprovado_em",
    )
    .neq("estado", "pendente");
  if (error) falhaDeLeitura("inquilinos", error);
  const canceladas = data.filter((b) => b.estado === "cancelado").map((b) => b.id);
  const saidas = new Map<string, string>();
  if (canceladas.length) {
    const { data: audit, error: e2 } = await bd
      .from("auditoria")
      .select("inquilino_id, criado_em")
      .eq("accao", "inquilino_alterado")
      .in("inquilino_id", canceladas)
      .contains("detalhes", { campos: ["estado"] })
      .order("criado_em", { ascending: false });
    if (e2) falhaDeLeitura("auditoria", e2);
    for (const a of audit)
      if (a.inquilino_id && !saidas.has(a.inquilino_id))
        saidas.set(a.inquilino_id, hojeIso(new Date(a.criado_em)));
  }
  return data.map((b) => ({
    ...b,
    aprovadaEm: b.aprovado_em ? hojeIso(new Date(b.aprovado_em)) : null,
    canceladaEm: saidas.get(b.id) ?? null,
  }));
}

export async function recebimentosDesde(bd: ClienteBD, desde: string): Promise<RecebimentoFin[]> {
  const { data, error } = await bd
    .from("recebimentos")
    .select("valor, data")
    .gte("data", desde)
    .order("data");
  if (error) falhaDeLeitura("recebimentos", error);
  return data.map((r) => ({ valorCent: centimosDeNumeric(r.valor), data: r.data }));
}

export type Meta = { mes: string; valorCent: number; base: "mrr" | "recebido" };

export async function listarMetas(bd: ClienteBD): Promise<Meta[]> {
  const { data, error } = await bd.from("metas_faturacao").select("mes, valor_sem_iva, base");
  if (error) falhaDeLeitura("metas_faturacao", error);
  return data.map((m) => ({
    mes: m.mes,
    valorCent: centimosDeNumeric(m.valor_sem_iva),
    base: m.base as Meta["base"],
  }));
}

/** Uma meta por mês: gravar outra vez o mesmo mês substitui-a. */
export async function guardarMeta(bd: ClienteBD, m: Meta) {
  const { error } = await bd
    .from("metas_faturacao")
    .upsert(
      { mes: m.mes, valor_sem_iva: numericParaGravar(m.valorCent), base: m.base },
      { onConflict: "mes" },
    );
  return !error;
}

/** Recebimentos de um intervalo, com o nome da barbearia (exportação, O.10). */
export async function recebimentosComBarbearia(bd: ClienteBD, desde: string, ate: string) {
  const { data, error } = await bd
    .from("recebimentos")
    .select("valor, data, inquilinos(nome)")
    .gte("data", desde)
    .lte("data", ate)
    .order("data");
  if (error) falhaDeLeitura("recebimentos", error);
  return data.map((r) => ({
    valorCent: centimosDeNumeric(r.valor),
    data: r.data,
    barbearia: r.inquilinos?.nome ?? "",
  }));
}
