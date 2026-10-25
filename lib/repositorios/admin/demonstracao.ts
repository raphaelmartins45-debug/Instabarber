import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// A barbearia de demonstração (D-162): dados fictícios refeitos para hoje pela função
// preparar_demonstracao() (só os administradores).

export async function prepararDemonstracao(bd: ClienteBD): Promise<string | null> {
  const { data, error } = await bd.rpc("preparar_demonstracao");
  return error ? null : data;
}

export async function obterDemonstracao(
  bd: ClienteBD,
): Promise<{ id: string; slug: string } | null> {
  const { data, error } = await bd
    .from("inquilinos")
    .select("id, slug")
    .eq("demonstracao", true)
    .maybeSingle();
  if (error) falhaDeLeitura("inquilinos", error);
  return data;
}
