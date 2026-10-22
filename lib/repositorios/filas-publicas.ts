import type { ClienteBD } from "@/lib/supabase/tipos";

// Filas do lado do cliente (F.4.1, F.4.3): só pelas funções da base de dados. O id da entrada é
// a chave que o cliente guarda para ver a posição.

const motivo = (m: string) => m.match(/^[a-z_]+$/)?.[0] ?? "erro";

export async function entrarFilaEspera(
  bd: ClienteBD,
  d: {
    inquilinoId: string;
    servicoId: string;
    dia: string;
    nome: string;
    telefone: string;
    consentimento: boolean;
  },
): Promise<{ ok: true; posicao: number } | { ok: false; motivo: string }> {
  const { data, error } = await bd.rpc("entrar_fila_espera", {
    p_inquilino: d.inquilinoId,
    p_servico: d.servicoId,
    p_dia: d.dia,
    p_nome: d.nome,
    p_telefone: d.telefone,
    p_consentimento: d.consentimento,
  });
  if (error) return { ok: false, motivo: motivo(error.message) };
  const { data: posicao } = await bd.rpc("posicao_fila_espera", { p_entrada: data });
  return { ok: true, posicao: posicao ?? 1 };
}

export async function entrarFilaPresencial(
  bd: ClienteBD,
  d: {
    inquilinoId: string;
    servicoId: string | null;
    nome: string;
    telefone: string;
    consentimento: boolean;
  },
): Promise<{ ok: true; entradaId: string } | { ok: false; motivo: string }> {
  const { data, error } = await bd.rpc("entrar_fila_presencial", {
    p_inquilino: d.inquilinoId,
    p_nome: d.nome,
    p_telefone: d.telefone,
    p_servico: d.servicoId ?? undefined,
    p_consentimento: d.consentimento,
  });
  const entrada = data?.[0]?.entrada_id;
  if (error || !entrada) return { ok: false, motivo: motivo(error?.message ?? "erro") };
  return { ok: true, entradaId: entrada };
}

export type EstadoEntrada = {
  estado: "aguarda" | "em_atendimento" | "atendido" | "saiu";
  posicao: number;
  minutosAFrente: number;
  minutosEmCurso: number;
  profissionais: number;
};

/** Nulo quando a entrada não existe ou não é de hoje. */
export async function estadoFilaPresencial(
  bd: ClienteBD,
  entradaId: string,
): Promise<EstadoEntrada | null> {
  const { data } = await bd.rpc("estado_fila_presencial", { p_entrada: entradaId });
  const l = data?.[0];
  if (!l) return null;
  return {
    estado: l.estado as EstadoEntrada["estado"],
    posicao: l.posicao,
    minutosAFrente: l.minutos_a_frente,
    minutosEmCurso: l.minutos_em_curso,
    profissionais: l.profissionais,
  };
}

/** O cliente da entrada, para criar o acesso logo (F.9). Só com a chave de serviço. */
export async function clienteDaEntrada(servico: ClienteBD, entradaId: string) {
  const { data } = await servico
    .from("fila_presencial")
    .select("cliente_id")
    .eq("id", entradaId)
    .maybeSingle();
  if (!data) return null;
  const { data: direto } = await servico.rpc("pode_criar_acesso_direto", {
    p_cliente: data.cliente_id,
  });
  return { clienteId: data.cliente_id, direto: direto === true };
}
