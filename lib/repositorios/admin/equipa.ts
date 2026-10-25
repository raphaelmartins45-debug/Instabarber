import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// A equipa InstaBarber (D-161): perfis sem barbearia. Os administradores leem (RLS perfis_ler);
// só o dono escreve (perfis_escrever_plataforma), e as contas criam-se com a chave de serviço.

export type MembroEquipa = {
  perfilId: string;
  userId: string;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
};

export async function listarEquipaPlataforma(bd: ClienteBD): Promise<MembroEquipa[]> {
  const { data, error } = await bd
    .from("perfis")
    .select("id, user_id, nome, email, papel, ativo")
    .is("inquilino_id", null)
    .order("nome");
  if (error) falhaDeLeitura("perfis", error);
  return data.map((p) => ({
    perfilId: p.id,
    userId: p.user_id,
    nome: p.nome ?? p.email ?? "",
    email: p.email ?? "",
    papel: p.papel,
    ativo: p.ativo,
  }));
}

/** Os comerciais ativos, para atribuir leads e ver o desempenho. */
export async function listarComerciais(bd: ClienteBD): Promise<MembroEquipa[]> {
  return (await listarEquipaPlataforma(bd)).filter((m) => m.papel === "comercial" && m.ativo);
}

/** O perfil de uma pessoa nova da equipa (só o dono: RLS perfis_escrever_plataforma). */
export async function criarPerfilPlataforma(
  bd: ClienteBD,
  p: { userId: string; papel: string; nome: string; email: string },
): Promise<boolean> {
  const { error } = await bd.from("perfis").insert({
    user_id: p.userId,
    inquilino_id: null,
    papel: p.papel,
    nome: p.nome,
    email: p.email,
  });
  return !error;
}

export async function alterarMembro(
  bd: ClienteBD,
  perfilId: string,
  alteracao: { papel?: string; ativo?: boolean },
): Promise<boolean> {
  const { data, error } = await bd
    .from("perfis")
    .update(alteracao)
    .eq("id", perfilId)
    .is("inquilino_id", null)
    .select("id");
  return !error && data.length === 1;
}
