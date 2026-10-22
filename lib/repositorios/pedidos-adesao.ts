import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Json } from "@/types/database";

// Pedidos de adesão (D.8). O público só submete (função com EXECUTE para anon); o resto é do
// super_admin com dois fatores (RLS adesoes_admin).

export async function submeterPedidoAdesao(
  bd: ClienteBD,
  payload: Record<string, unknown>,
): Promise<string | null> {
  const { data, error } = await bd.rpc("submeter_pedido_adesao", { p: payload as Json });
  if (error) {
    console.error("adesao_falhou", error.message);
    return null;
  }
  return data;
}
