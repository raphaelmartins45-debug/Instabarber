import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "../erros";

// A configuração da barbearia, lida pela equipa (RLS inquilinos_ler) e alterada só pelo
// gestor (inquilinos_alterar). Os campos do plano são protegidos por gatilho (proteger_inquilino).

export type ConfiguracaoBarbearia = Database["public"]["Tables"]["inquilinos"]["Row"];
export type AlteracaoConfiguracao = Database["public"]["Tables"]["inquilinos"]["Update"];

export async function obterConfiguracao(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<ConfiguracaoBarbearia> {
  const { data, error } = await bd.from("inquilinos").select("*").eq("id", inquilinoId).single();
  if (error) falhaDeLeitura("inquilinos", error);
  return data;
}

export async function alterarConfiguracao(
  bd: ClienteBD,
  inquilinoId: string,
  alteracao: AlteracaoConfiguracao,
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const { error } = await bd.from("inquilinos").update(alteracao).eq("id", inquilinoId);
  return error ? { ok: false, motivo: error.message } : { ok: true };
}
