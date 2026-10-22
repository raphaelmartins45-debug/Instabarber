import "server-only";
import { definirContaCliente } from "@/lib/auth/contas";
import { emailTecnicoCliente } from "@/lib/regras/conta-cliente";
import { ligarContaCliente } from "@/lib/repositorios/clientes-conta";
import type { ClienteBD } from "@/lib/supabase/tipos";

/**
 * Palavra-passe escolhida na primeira entrada (F.9): com um número novo na barbearia
 * (pode_criar_acesso_direto), cria a conta e inicia a sessão; senão, o acesso faz-se por código.
 */
export async function criarAcessoDireto(
  bd: ClienteBD,
  servico: ClienteBD,
  d: {
    inquilinoId: string;
    telefone: string;
    palavraPasse: string;
    cliente: { clienteId: string; direto: boolean } | null;
  },
): Promise<"criado" | "codigo"> {
  if (!d.cliente?.direto) return "codigo";
  const email = emailTecnicoCliente(d.telefone, d.inquilinoId);
  const conta = await definirContaCliente(servico, {
    authUserId: null,
    email,
    palavraPasse: d.palavraPasse,
  });
  if (!conta.ok) return "codigo";
  await ligarContaCliente(servico, d.cliente.clienteId, conta.userId);
  await bd.auth.signInWithPassword({ email, password: d.palavraPasse });
  return "criado";
}
