import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";

// Perfis da equipa e da plataforma. O cliente final não tem perfil (CLAUDE.md §3).
// Cada utilizador lê os seus perfis (RLS perfis_ler); o super_admin escreve-os.

export type Papel = "super_admin" | "proprietario" | "profissional";

export type MeuPerfil = {
  id: string;
  papel: Papel;
  inquilino: { id: string; nome: string; slug: string; estado: string } | null;
};

/** Os perfis ativos do utilizador, com a barbearia de cada um. */
export async function listarMeusPerfis(bd: ClienteBD, userId: string): Promise<MeuPerfil[]> {
  const { data, error } = await bd
    .from("perfis")
    .select("id, papel, inquilinos(id, nome, slug, estado)")
    .eq("user_id", userId)
    .eq("ativo", true)
    .order("criado_em");
  if (error) falhaDeLeitura("perfis", error);
  return data.map((p) => ({ id: p.id, papel: p.papel as Papel, inquilino: p.inquilinos }));
}

/** O perfil de um utilizador numa barbearia com um papel, se existir (chave de serviço). */
export async function obterPerfil(
  bd: ClienteBD,
  userId: string,
  inquilinoId: string,
  papel: Papel,
): Promise<{ id: string; ativo: boolean } | null> {
  const { data, error } = await bd
    .from("perfis")
    .select("id, ativo")
    .eq("user_id", userId)
    .eq("inquilino_id", inquilinoId)
    .eq("papel", papel)
    .maybeSingle();
  if (error) falhaDeLeitura("perfis", error);
  return data;
}

/** Cria o perfil de profissional. Só o super_admin ou a chave de serviço escrevem perfis. */
export async function criarPerfilProfissional(
  bd: ClienteBD,
  dados: { userId: string; inquilinoId: string; nome: string; email: string },
): Promise<string> {
  const { data, error } = await bd
    .from("perfis")
    .insert({
      user_id: dados.userId,
      inquilino_id: dados.inquilinoId,
      papel: "profissional",
      nome: dados.nome,
      email: dados.email,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Escrita falhou (perfis): ${error.message}`);
  return data.id;
}

/** A conta de um membro da equipa pelo e-mail guardado nos perfis (chave de serviço). */
export async function procurarUtilizadorPorEmail(
  bd: ClienteBD,
  email: string,
): Promise<string | null> {
  const { data, error } = await bd
    .from("perfis")
    .select("user_id")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (error) falhaDeLeitura("perfis", error);
  return data?.user_id ?? null;
}

/** As contas dos perfis desta barbearia (o gestor lê-as pelo RLS), por id de perfil. */
export async function contasDosPerfis(
  bd: ClienteBD,
  perfilIds: string[],
): Promise<Map<string, string>> {
  if (perfilIds.length === 0) return new Map();
  const { data, error } = await bd.from("perfis").select("id, user_id").in("id", perfilIds);
  if (error) falhaDeLeitura("perfis", error);
  return new Map(data.map((p) => [p.id, p.user_id]));
}
