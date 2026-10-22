import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Grelha de funcionalidades de uma barbearia (D.3, D.4). Só o super_admin escreve; o gatilho
// auditar_interruptor regista cada alteração com autor e data.

export type LinhaGrelha = { chave: string; ativa: boolean; bonus: boolean };

export async function lerGrelhaBarbearia(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<LinhaGrelha[]> {
  const { data, error } = await bd
    .from("inquilino_funcionalidades")
    .select("chave, ativa, bonus")
    .eq("inquilino_id", inquilinoId);
  if (error) falhaDeLeitura("inquilino_funcionalidades", error);
  return data;
}

/** Grava só o que mudou. Fora do plano, ligada = bónus (D.4). */
export async function guardarGrelha(
  bd: ClienteBD,
  inquilinoId: string,
  alteracoes: LinhaGrelha[],
  userId: string,
): Promise<boolean> {
  if (alteracoes.length === 0) return true;
  const { error } = await bd.from("inquilino_funcionalidades").upsert(
    alteracoes.map((a) => ({
      inquilino_id: inquilinoId,
      chave: a.chave,
      ativa: a.ativa,
      bonus: a.bonus,
      alterado_por: userId,
      alterado_em: new Date().toISOString(),
    })),
  );
  return !error;
}
