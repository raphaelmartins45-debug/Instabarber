import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Promoções da página pública (E.6): o gestor cria, liga, desliga e remove. A vista
// `publico_promocoes` mostra só as ativas dentro das datas; a RLS só deixa o proprietário escrever.

export type Promocao = {
  id: string;
  titulo: string;
  descricao: string | null;
  inicio: string | null;
  fim: string | null;
  ativa: boolean;
};

export async function listarPromocoes(bd: ClienteBD, inquilinoId: string): Promise<Promocao[]> {
  const { data, error } = await bd
    .from("promocoes")
    .select("id, titulo, descricao, inicio, fim, ativa")
    .eq("inquilino_id", inquilinoId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("promocoes", error);
  return data;
}

export async function criarPromocao(
  bd: ClienteBD,
  inquilinoId: string,
  p: Omit<Promocao, "id" | "ativa">,
): Promise<boolean> {
  const { error } = await bd.from("promocoes").insert({ inquilino_id: inquilinoId, ...p });
  return !error;
}

export async function alternarPromocao(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
  ativa: boolean,
): Promise<boolean> {
  const { error } = await bd
    .from("promocoes")
    .update({ ativa })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id);
  return !error;
}

export async function removerPromocao(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("promocoes")
    .delete()
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("id");
  return !error && data.length > 0;
}
