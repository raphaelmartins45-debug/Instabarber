import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";

// Pedidos de acesso do cliente (B9): a equipa lê os códigos para os enviar por wa.me e
// marca-os como enviados. Ninguém os escreve de outra forma (RLS codigos_*).

export type PedidoAcesso = {
  id: string;
  codigo: string;
  expira_em: string;
  enviado_em: string | null;
  cliente: { nome: string; telefone: string | null } | null;
};

/** Códigos por usar e dentro do prazo, do mais recente para o mais antigo. */
export async function listarPedidosAcesso(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<PedidoAcesso[]> {
  const { data, error } = await bd
    .from("codigos_acesso")
    .select(
      "id, codigo, expira_em, enviado_em, clientes!codigos_acesso_inquilino_id_cliente_id_fkey(nome, telefone)",
    )
    .eq("inquilino_id", inquilinoId)
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("codigos_acesso", error);
  return data.map(({ clientes, ...resto }) => ({ ...resto, cliente: clientes }));
}

/** Marca o código como enviado, depois de a equipa o confirmar à mão (regra 7). */
export async function marcarCodigoEnviado(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("codigos_acesso")
    .update({ enviado_em: new Date().toISOString() })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`Escrita falhou (codigos_acesso): ${error.message}`);
  return data.length === 1;
}
