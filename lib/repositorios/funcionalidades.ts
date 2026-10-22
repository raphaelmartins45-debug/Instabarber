import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "./erros";

// A grelha (D.3). Só o super_admin escreve; a equipa lê. A verificação que conta é a da
// base de dados (funcionalidade_ativa()); isto serve para montar menus e ecrãs.

export type Funcionalidade = Database["public"]["Tables"]["funcionalidades"]["Row"];

/** O catálogo de funcionalidades, por grupo e ordem. */
export async function listarFuncionalidades(bd: ClienteBD): Promise<Funcionalidade[]> {
  const { data, error } = await bd
    .from("funcionalidades")
    .select("*")
    .order("grupo")
    .order("ordem");
  if (error) falhaDeLeitura("funcionalidades", error);
  return data;
}

/** As chaves ligadas numa barbearia. Vazio para quem não é da equipa dela (RLS). */
export async function listarChavesAtivas(bd: ClienteBD, inquilinoId: string): Promise<string[]> {
  const { data, error } = await bd
    .from("inquilino_funcionalidades")
    .select("chave")
    .eq("inquilino_id", inquilinoId)
    .eq("ativa", true)
    .order("chave");
  if (error) falhaDeLeitura("inquilino_funcionalidades", error);
  return data.map((linha) => linha.chave);
}

/** As chaves de cada plano (pacote_funcionalidades). Públicas: o formulário de adesão mostra-as (D.9). */
export async function listarPacotes(bd: ClienteBD): Promise<Record<"basic" | "pro", string[]>> {
  const { data, error } = await bd.from("pacote_funcionalidades").select("plano, chave");
  if (error) falhaDeLeitura("pacote_funcionalidades", error);
  return {
    basic: data.filter((l) => l.plano === "basic").map((l) => l.chave),
    pro: data.filter((l) => l.plano === "pro").map((l) => l.chave),
  };
}
