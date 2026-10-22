import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Módulos preparados e desligados (G.4): só o super_admin os lê e liga (RLS). Cada alteração
// fica em auditoria pelos gatilhos auditar_modulo_plataforma e auditar_interruptor.

export type ChaveModulo = "pagamentos" | "faturacao";

export async function listarModulos(
  bd: ClienteBD,
): Promise<{ chave: ChaveModulo; ativo: boolean; alteradoEm: string }[]> {
  const { data, error } = await bd.from("modulos_plataforma").select("chave, ativo, alterado_em");
  if (error) falhaDeLeitura("modulos_plataforma", error);
  return data.map((m) => ({
    chave: m.chave as ChaveModulo,
    ativo: m.ativo,
    alteradoEm: m.alterado_em,
  }));
}

export async function listarModulosBarbearias(
  bd: ClienteBD,
): Promise<{ inquilinoId: string; chave: ChaveModulo; ativo: boolean }[]> {
  const { data, error } = await bd.from("inquilino_modulos").select("inquilino_id, chave, ativo");
  if (error) falhaDeLeitura("inquilino_modulos", error);
  return data.map((m) => ({
    inquilinoId: m.inquilino_id,
    chave: m.chave as ChaveModulo,
    ativo: m.ativo,
  }));
}

export async function alternarModuloGeral(
  bd: ClienteBD,
  chave: ChaveModulo,
  ativo: boolean,
  userId: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("modulos_plataforma")
    .update({ ativo, alterado_por: userId, alterado_em: new Date().toISOString() })
    .eq("chave", chave)
    .select("chave");
  return !error && data.length === 1;
}

export async function alternarModuloBarbearia(
  bd: ClienteBD,
  inquilinoId: string,
  chave: ChaveModulo,
  ativo: boolean,
  userId: string,
): Promise<boolean> {
  const { error } = await bd.from("inquilino_modulos").upsert(
    {
      inquilino_id: inquilinoId,
      chave,
      ativo,
      alterado_por: userId,
      alterado_em: new Date().toISOString(),
    },
    { onConflict: "inquilino_id,chave" },
  );
  return !error;
}
