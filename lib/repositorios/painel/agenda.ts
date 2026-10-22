import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { TablesInsert } from "@/types/database";
import { falhaDeLeitura } from "../erros";

// Agenda da barbearia (E.2, E.3). A base de dados valida a vaga e aplica o preço (gatilho
// marcacoes_antes_gravar); concluir e marcar falta só pelas funções concluir_marcacao() e
// marcar_falta(). O RLS deixa o barbeiro ver e mexer só nas suas marcações.

export type EstadoMarcacao = "reservada" | "agendada" | "concluida" | "falta" | "cancelada";

export type MarcacaoDia = {
  id: string;
  inicio: string;
  fim: string;
  estado: EstadoMarcacao;
  origem: string;
  valorTabelaCent: number;
  valorCobradoCent: number;
  descontoPercent: number;
  lembreteAbertoEm: string | null;
  profissionalId: string | null;
  profissional: string | null;
  servicoId: string;
  servico: string;
  clienteId: string | null;
  cliente: string | null;
  telefone: string | null;
};

const COLUNAS = `id, inicio, fim, estado, origem, valor_tabela, valor_cobrado, desconto_percent,
  lembrete_aberto_em, profissional_id, servico_id, cliente_id,
  profissionais(nome_apresentado), servicos(nome), clientes(nome, telefone)`;

type Linha = {
  id: string;
  inicio: string;
  fim: string;
  estado: string;
  origem: string;
  valor_tabela: number;
  valor_cobrado: number;
  desconto_percent: number;
  lembrete_aberto_em: string | null;
  profissional_id: string | null;
  servico_id: string;
  cliente_id: string | null;
  profissionais: { nome_apresentado: string } | null;
  servicos: { nome: string } | null;
  clientes: { nome: string; telefone: string | null } | null;
};

function paraMarcacao(l: Linha): MarcacaoDia {
  return {
    id: l.id,
    inicio: l.inicio,
    fim: l.fim,
    estado: l.estado as EstadoMarcacao,
    origem: l.origem,
    valorTabelaCent: centimosDeNumeric(l.valor_tabela),
    valorCobradoCent: centimosDeNumeric(l.valor_cobrado),
    descontoPercent: Number(l.desconto_percent),
    lembreteAbertoEm: l.lembrete_aberto_em,
    profissionalId: l.profissional_id,
    profissional: l.profissionais?.nome_apresentado ?? null,
    servicoId: l.servico_id,
    servico: l.servicos?.nome ?? "",
    clienteId: l.cliente_id,
    cliente: l.clientes?.nome ?? null,
    telefone: l.clientes?.telefone ?? null,
  };
}

/** Marcações entre dois instantes (sem as reservas da página pública nem as canceladas). */
export async function listarMarcacoes(
  bd: ClienteBD,
  inquilinoId: string,
  intervalo: { de: Date; ate: Date },
  filtro: { profissionalId?: string | null; estados?: EstadoMarcacao[] } = {},
): Promise<MarcacaoDia[]> {
  let q = bd
    .from("marcacoes")
    .select(COLUNAS)
    .eq("inquilino_id", inquilinoId)
    .gte("inicio", intervalo.de.toISOString())
    .lt("inicio", intervalo.ate.toISOString())
    .in("estado", filtro.estados ?? ["agendada", "concluida", "falta"])
    .order("inicio");
  if (filtro.profissionalId) q = q.eq("profissional_id", filtro.profissionalId);
  const { data, error } = await q;
  if (error) falhaDeLeitura("marcacoes", error);
  return (data as unknown as Linha[]).map(paraMarcacao);
}

/** Marcações agendadas sem profissional (órfãs), de agora em diante. */
export async function listarOrfas(bd: ClienteBD, inquilinoId: string): Promise<MarcacaoDia[]> {
  const { data, error } = await bd
    .from("marcacoes")
    .select(COLUNAS)
    .eq("inquilino_id", inquilinoId)
    .eq("estado", "agendada")
    .is("profissional_id", null)
    .order("inicio");
  if (error) falhaDeLeitura("marcacoes", error);
  return (data as unknown as Linha[]).map(paraMarcacao);
}

export async function obterMarcacao(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<MarcacaoDia | null> {
  const { data, error } = await bd
    .from("marcacoes")
    .select(COLUNAS)
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .maybeSingle();
  if (error) falhaDeLeitura("marcacoes", error);
  return data ? paraMarcacao(data as unknown as Linha) : null;
}

export type Ausencia = {
  id: string;
  profissionalId: string | null;
  inicio: string;
  fim: string;
  tipo: string;
  motivo: string | null;
};

/** Ausências que tocam o intervalo (da barbearia inteira ou de um profissional). */
export async function listarAusencias(
  bd: ClienteBD,
  inquilinoId: string,
  intervalo: { de: Date; ate: Date },
): Promise<Ausencia[]> {
  const { data, error } = await bd
    .from("ausencias")
    .select("id, profissional_id, inicio, fim, tipo, motivo")
    .eq("inquilino_id", inquilinoId)
    .lt("inicio", intervalo.ate.toISOString())
    .gt("fim", intervalo.de.toISOString())
    .order("inicio");
  if (error) falhaDeLeitura("ausencias", error);
  return data.map((a) => ({
    id: a.id,
    profissionalId: a.profissional_id,
    inicio: a.inicio,
    fim: a.fim,
    tipo: a.tipo,
    motivo: a.motivo,
  }));
}

export type Vaga = { profissionalId: string; inicio: string; valorCobradoCent: number };

/** Vagas livres de um dia para um serviço, com as regras do balcão (sem antecedência nem janela). */
export async function vagasDoDia(
  bd: ClienteBD,
  inquilinoId: string,
  servicoId: string,
  dia: string,
  profissionalId: string | null,
): Promise<Vaga[]> {
  const { data, error } = await bd.rpc("vagas_livres", {
    p_inquilino: inquilinoId,
    p_servico: servicoId,
    p_dia: dia,
    p_profissional: profissionalId ?? undefined,
    p_publico: false,
  });
  if (error) falhaDeLeitura("vagas_livres", error);
  return data.map((v) => ({
    profissionalId: v.profissional_id,
    inicio: v.inicio,
    valorCobradoCent: centimosDeNumeric(v.valor_cobrado),
  }));
}

export type ResultadoAgenda = { ok: true; id?: string } | { ok: false; motivo: string };

const motivo = (m: string) => m.match(/^[a-z_]+$/)?.[0] ?? "erro";

/** Marcação ao balcão: o gatilho calcula o fim, valida a vaga e aplica o preço do período. */
export async function criarMarcacaoBalcao(
  bd: ClienteBD,
  dados: {
    inquilinoId: string;
    clienteId: string;
    profissionalId: string;
    servicoId: string;
    inicio: string;
    criadoPor: string;
  },
): Promise<ResultadoAgenda> {
  // fim, fim_bloqueio e os valores são preenchidos pelo gatilho marcacoes_antes_gravar.
  const linha = {
    inquilino_id: dados.inquilinoId,
    cliente_id: dados.clienteId,
    profissional_id: dados.profissionalId,
    servico_id: dados.servicoId,
    inicio: dados.inicio,
    origem: "balcao",
    estado: "agendada",
    criado_por: dados.criadoPor,
  } as unknown as TablesInsert<"marcacoes">;
  const { data, error } = await bd.from("marcacoes").insert(linha).select("id").single();
  if (error) {
    if (error.code === "23P01") return { ok: false, motivo: "ocupado" };
    return { ok: false, motivo: motivo(error.message) };
  }
  return { ok: true, id: data.id };
}

export type ModoConclusao = "normal" | "credito_clube" | "premio";

export async function concluirMarcacao(
  bd: ClienteBD,
  id: string,
  modo: ModoConclusao,
  valorCobrado: number | null,
): Promise<ResultadoAgenda> {
  const { data, error } = await bd.rpc("concluir_marcacao", {
    p_marcacao: id,
    p_modo: modo,
    p_valor_cobrado: valorCobrado ?? undefined,
  });
  if (error) return { ok: false, motivo: motivo(error.message) };
  return { ok: true, id: data };
}

export async function marcarFalta(bd: ClienteBD, id: string): Promise<ResultadoAgenda> {
  const { error } = await bd.rpc("marcar_falta", { p_marcacao: id });
  if (error) return { ok: false, motivo: motivo(error.message) };
  return { ok: true };
}

export async function cancelarMarcacao(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<ResultadoAgenda> {
  const { data, error } = await bd
    .from("marcacoes")
    .update({ estado: "cancelada", motivo_cancelamento: "balcao" })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .eq("estado", "agendada")
    .select("id");
  if (error) return { ok: false, motivo: motivo(error.message) };
  return data.length ? { ok: true } : { ok: false, motivo: "marcacao_invalida" };
}

/** A ligação wa.me do lembrete foi aberta (não é prova de envio). */
export async function registarLembrete(bd: ClienteBD, inquilinoId: string, id: string) {
  const { error } = await bd
    .from("marcacoes")
    .update({ lembrete_aberto_em: new Date().toISOString() })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id);
  return !error;
}

/** Atribui um profissional a uma órfã; o gatilho volta a validar a vaga. */
export async function atribuirProfissional(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
  profissionalId: string,
): Promise<ResultadoAgenda> {
  const { data, error } = await bd
    .from("marcacoes")
    .update({ profissional_id: profissionalId })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .is("profissional_id", null)
    .select("id");
  if (error) {
    if (error.code === "23P01") return { ok: false, motivo: "ocupado" };
    return { ok: false, motivo: motivo(error.message) };
  }
  return data.length ? { ok: true } : { ok: false, motivo: "marcacao_invalida" };
}
