import "server-only";
import type { ClienteBD } from "@/lib/supabase/tipos";

// Contas do Supabase Auth, só com a chave de serviço (CLAUDE.md §3: criar contas de
// autenticação). Nenhuma palavra-passe passa por aqui exceto a que o cliente escolhe na
// rota api/acesso, que vai direta para o Supabase Auth.

export type ResultadoConvite =
  | { ok: true; userId: string; novo: boolean }
  | { ok: false; motivo: "conta_sem_perfil" | "falhou" };

/**
 * Convida por e-mail (enviado pelo SMTP do Supabase, o Resend). Se a pessoa já tem conta
 * de equipa noutra barbearia, devolve essa conta sem enviar nada.
 */
export async function convidarOuEncontrar(
  servico: ClienteBD,
  dados: { email: string; nome: string; destino: string },
  procurarExistente: (email: string) => Promise<string | null>,
): Promise<ResultadoConvite> {
  const { data, error } = await servico.auth.admin.inviteUserByEmail(dados.email, {
    redirectTo: dados.destino,
    data: { nome: dados.nome },
  });
  if (!error && data.user) return { ok: true, userId: data.user.id, novo: true };
  if (error?.code === "email_exists" || error?.status === 422) {
    const existente = await procurarExistente(dados.email);
    return existente
      ? { ok: true, userId: existente, novo: false }
      : { ok: false, motivo: "conta_sem_perfil" };
  }
  return { ok: false, motivo: "falhou" };
}

/** Volta a enviar o convite a quem ainda não entrou. */
export async function reenviarConvite(
  servico: ClienteBD,
  email: string,
  destino: string,
): Promise<boolean> {
  const { error } = await servico.auth.admin.inviteUserByEmail(email, { redirectTo: destino });
  return !error;
}

export type EntradaConta = { convidadoEm: string | null; ultimaEntrada: string | null };

/** Quando cada conta foi convidada e quando entrou pela última vez. */
export async function lerEntradas(
  servico: ClienteBD,
  userIds: string[],
): Promise<Map<string, EntradaConta>> {
  const pares = await Promise.all(
    userIds.map(async (id) => {
      const { data } = await servico.auth.admin.getUserById(id);
      const u = data.user;
      return [
        id,
        {
          convidadoEm: u?.invited_at ?? u?.created_at ?? null,
          ultimaEntrada: u?.last_sign_in_at ?? null,
        },
      ] as const;
    }),
  );
  return new Map(pares);
}

/** Cria a conta técnica do cliente, ou muda-lhe a palavra-passe se já existir (F.9). */
export async function definirContaCliente(
  servico: ClienteBD,
  dados: { authUserId: string | null; email: string; palavraPasse: string },
): Promise<{ ok: true; userId: string } | { ok: false; fraca: boolean }> {
  if (dados.authUserId) {
    const { error } = await servico.auth.admin.updateUserById(dados.authUserId, {
      password: dados.palavraPasse,
    });
    return error
      ? { ok: false, fraca: error.code === "weak_password" }
      : { ok: true, userId: dados.authUserId };
  }
  const { data, error } = await servico.auth.admin.createUser({
    email: dados.email,
    password: dados.palavraPasse,
    email_confirm: true,
  });
  if (error || !data.user) return { ok: false, fraca: error?.code === "weak_password" };
  return { ok: true, userId: data.user.id };
}
