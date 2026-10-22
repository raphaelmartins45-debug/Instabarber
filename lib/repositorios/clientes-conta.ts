import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";

// A conta do cliente final (B.6, F.9). As escritas em clientes.auth_user_id são feitas pela
// rota api/acesso com a chave de serviço, depois de verificado o código.

export type ContaCliente = { id: string; nome: string; auth_user_id: string | null };

export async function obterContaCliente(
  bd: ClienteBD,
  inquilinoId: string,
  clienteId: string,
): Promise<ContaCliente | null> {
  const { data, error } = await bd
    .from("clientes")
    .select("id, nome, auth_user_id")
    .eq("inquilino_id", inquilinoId)
    .eq("id", clienteId)
    .maybeSingle();
  if (error) falhaDeLeitura("clientes", error);
  return data;
}

export async function ligarContaCliente(
  bd: ClienteBD,
  clienteId: string,
  authUserId: string,
): Promise<void> {
  const { error } = await bd
    .from("clientes")
    .update({ auth_user_id: authUserId })
    .eq("id", clienteId);
  if (error) throw new Error(`Escrita falhou (clientes): ${error.message}`);
}

/** A ficha ligada à conta do utilizador nesta barbearia (RLS: meus_clientes). */
export async function obterMinhaFicha(
  bd: ClienteBD,
  inquilinoId: string,
  userId: string,
): Promise<{ id: string; nome: string } | null> {
  const { data, error } = await bd
    .from("clientes")
    .select("id, nome")
    .eq("inquilino_id", inquilinoId)
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (error) falhaDeLeitura("clientes", error);
  return data;
}
