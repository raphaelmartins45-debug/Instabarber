import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database, Json } from "@/types/database";
import { falhaDeLeitura } from "./erros";

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

export type PedidoAdesaoLinha = Database["public"]["Tables"]["pedidos_adesao"]["Row"];

export async function listarPedidos(
  bd: ClienteBD,
  estado = "pendente",
): Promise<PedidoAdesaoLinha[]> {
  const { data, error } = await bd
    .from("pedidos_adesao")
    .select("*")
    .eq("estado", estado)
    .order("submetido_em", { ascending: false });
  if (error) falhaDeLeitura("pedidos_adesao", error);
  return data;
}

export async function obterPedido(bd: ClienteBD, id: string): Promise<PedidoAdesaoLinha | null> {
  const { data, error } = await bd.from("pedidos_adesao").select("*").eq("id", id).maybeSingle();
  if (error) falhaDeLeitura("pedidos_adesao", error);
  return data;
}

/** Fecha um pedido pendente (só se ainda estiver pendente: duas decisões não se sobrepõem). */
export async function decidirPedido(
  bd: ClienteBD,
  id: string,
  decisao:
    | { estado: "aprovado"; inquilinoId: string; revistoPor: string }
    | { estado: "rejeitado"; motivo: string; revistoPor: string },
): Promise<boolean> {
  const campos =
    decisao.estado === "aprovado"
      ? { estado: "aprovado", inquilino_id: decisao.inquilinoId }
      : { estado: "rejeitado", motivo_rejeicao: decisao.motivo };
  const { data, error } = await bd
    .from("pedidos_adesao")
    .update({ ...campos, revisto_por: decisao.revistoPor, decidido_em: new Date().toISOString() })
    .eq("id", id)
    .eq("estado", "pendente")
    .select("id");
  return !error && data.length === 1;
}
