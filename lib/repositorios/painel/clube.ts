import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Clube de assinatura (F.4.2). Inscrever e renovar só pelas funções inscrever_clube() e
// renovar_subscricao() (D-122); o pagamento é registado à mão, nunca cobrado.

export type Plano = {
  id: string;
  nome: string;
  precoCent: number;
  validadeDias: number;
  transitaCredito: boolean;
  renovacaoAuto: boolean;
  ativo: boolean;
  servicos: { servicoId: string; quantidade: number }[];
};

export async function listarPlanos(bd: ClienteBD, inquilinoId: string): Promise<Plano[]> {
  const { data, error } = await bd
    .from("clubes")
    .select(
      "id, nome, preco_mensal, validade_dias, transita_credito, renovacao_auto, ativo, clube_servicos(servico_id, quantidade_mes)",
    )
    .eq("inquilino_id", inquilinoId)
    .order("criado_em");
  if (error) falhaDeLeitura("clubes", error);
  return data.map((c) => ({
    id: c.id,
    nome: c.nome,
    precoCent: centimosDeNumeric(c.preco_mensal),
    validadeDias: c.validade_dias,
    transitaCredito: c.transita_credito,
    renovacaoAuto: c.renovacao_auto,
    ativo: c.ativo,
    servicos: c.clube_servicos.map((s) => ({
      servicoId: s.servico_id,
      quantidade: s.quantidade_mes,
    })),
  }));
}

export async function gravarPlano(
  bd: ClienteBD,
  inquilinoId: string,
  id: string | null,
  p: Omit<Plano, "id">,
): Promise<boolean> {
  const linha = {
    nome: p.nome,
    preco_mensal: numericParaGravar(p.precoCent),
    validade_dias: p.validadeDias,
    transita_credito: p.transitaCredito,
    renovacao_auto: p.renovacaoAuto,
    ativo: p.ativo,
  };
  let clubeId = id;
  if (id) {
    const { error } = await bd
      .from("clubes")
      .update(linha)
      .eq("inquilino_id", inquilinoId)
      .eq("id", id);
    if (error) return false;
  } else {
    const { data, error } = await bd
      .from("clubes")
      .insert({ ...linha, inquilino_id: inquilinoId })
      .select("id")
      .single();
    if (error) return false;
    clubeId = data.id;
  }
  // Os serviços incluídos substituem-se: os ciclos já abertos guardam os seus créditos.
  const apagar = await bd.from("clube_servicos").delete().eq("clube_id", clubeId!);
  if (apagar.error) return false;
  if (p.servicos.length === 0) return true;
  const { error } = await bd.from("clube_servicos").insert(
    p.servicos.map((s) => ({
      inquilino_id: inquilinoId,
      clube_id: clubeId!,
      servico_id: s.servicoId,
      quantidade_mes: s.quantidade,
    })),
  );
  return !error;
}

export type Subscricao = {
  id: string;
  cliente: string;
  clienteId: string;
  plano: string;
  estado: string;
  renovacaoAuto: boolean;
  proximaRenovacao: string;
  ciclo: {
    id: string;
    inicio: string;
    fim: string;
    valorCent: number;
    pagoEm: string | null;
    metodo: string | null;
  } | null;
  creditosPorUsar: number;
};

export async function listarSubscricoes(bd: ClienteBD, inquilinoId: string): Promise<Subscricao[]> {
  const { data, error } = await bd
    .from("subscricoes")
    .select(
      "id, estado, proxima_renovacao, cliente_id, clientes(nome), clubes(nome, renovacao_auto), ciclos_clube(id, inicio, fim, valor, pago_em, metodo, creditos_clube(quantidade, usados))",
    )
    .eq("inquilino_id", inquilinoId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("subscricoes", error);
  return data.map((s) => {
    const ciclos = [...s.ciclos_clube].sort((a, b) => b.inicio.localeCompare(a.inicio));
    const atual = ciclos[0];
    return {
      id: s.id,
      cliente: s.clientes?.nome ?? "",
      clienteId: s.cliente_id,
      plano: s.clubes?.nome ?? "",
      estado: s.estado,
      renovacaoAuto: s.clubes?.renovacao_auto ?? false,
      proximaRenovacao: s.proxima_renovacao,
      ciclo: atual
        ? {
            id: atual.id,
            inicio: atual.inicio,
            fim: atual.fim,
            valorCent: centimosDeNumeric(atual.valor),
            pagoEm: atual.pago_em,
            metodo: atual.metodo,
          }
        : null,
      creditosPorUsar: atual?.pago_em
        ? atual.creditos_clube.reduce((a, c) => a + Math.max(0, c.quantidade - c.usados), 0)
        : 0,
    };
  });
}

const motivo = (m: string) => m.match(/^[a-z_]+$/)?.[0] ?? "erro";

export async function inscrever(
  bd: ClienteBD,
  clienteId: string,
  planoId: string,
  inicio: string,
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const { error } = await bd.rpc("inscrever_clube", {
    p_cliente: clienteId,
    p_clube: planoId,
    p_inicio: inicio,
  });
  return error ? { ok: false, motivo: motivo(error.message) } : { ok: true };
}

export async function renovar(bd: ClienteBD, subscricaoId: string): Promise<boolean> {
  const { error } = await bd.rpc("renovar_subscricao", { p_subscricao: subscricaoId });
  return !error;
}

export async function marcarCicloPago(
  bd: ClienteBD,
  inquilinoId: string,
  cicloId: string,
  metodo: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("ciclos_clube")
    .update({ pago_em: new Date().toISOString(), metodo })
    .eq("inquilino_id", inquilinoId)
    .eq("id", cicloId)
    .is("pago_em", null)
    .select("id");
  return !error && data.length > 0;
}

export async function cancelarSubscricao(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("subscricoes")
    .update({ estado: "cancelada", cancelada_em: new Date().toISOString() })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .eq("estado", "ativa")
    .select("id");
  return !error && data.length > 0;
}
