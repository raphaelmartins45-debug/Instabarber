import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Json } from "@/types/database";
import { falhaDeLeitura } from "../erros";

// Auditoria (H.1): o super_admin lê; as ações do Admin escrevem-se por registar_auditoria_admin().

export type RegistoAuditoria = {
  id: number;
  inquilino_id: string | null;
  accao: string;
  entidade: string | null;
  detalhes: Json | null;
  criado_em: string;
};

export async function listarAuditoria(
  bd: ClienteBD,
  opcoes: { inquilinoId?: string; limite?: number } = {},
): Promise<RegistoAuditoria[]> {
  let q = bd
    .from("auditoria")
    .select("id, inquilino_id, accao, entidade, detalhes, criado_em")
    .order("criado_em", { ascending: false })
    .limit(opcoes.limite ?? 50);
  if (opcoes.inquilinoId) q = q.eq("inquilino_id", opcoes.inquilinoId);
  const { data, error } = await q;
  if (error) falhaDeLeitura("auditoria", error);
  return data;
}

export async function registarAcaoAdmin(
  bd: ClienteBD,
  acao: {
    inquilinoId: string | null;
    accao: string;
    entidade?: string;
    entidadeId?: string;
    detalhes?: Json;
  },
): Promise<void> {
  const { error } = await bd.rpc("registar_auditoria_admin", {
    p_inquilino: acao.inquilinoId as string,
    p_accao: acao.accao,
    p_entidade: acao.entidade ?? (null as unknown as string),
    p_entidade_id: acao.entidadeId ?? (null as unknown as string),
    p_detalhes: acao.detalhes ?? null,
  });
  if (error) throw new Error(`Auditoria falhou: ${error.message}`);
}

/** Rotina mensal (P-24, D-157): apaga a auditoria com mais do prazo. Devolve quantos registos. */
export async function apagarAuditoriaAntiga(bd: ClienteBD, meses = 24): Promise<number | null> {
  const { data, error } = await bd.rpc("apagar_auditoria_antiga", { p_meses: meses });
  return error ? null : data;
}
