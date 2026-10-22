import { adaptadorConfigurado } from "@/lib/pagamentos";
import { criarClienteServico } from "@/lib/supabase/servico";

// Webhook do fornecedor de pagamentos (G.4). Enquanto o interruptor geral estiver desligado —
// sempre, na versão 1 — responde 404, como se não existisse. Ligado, só aceita eventos com a
// assinatura certa e é idempotente pelo id externo (pagamentos.id_externo é único).

const naoExiste = () => new Response(null, { status: 404 });

export async function POST(pedido: Request) {
  // Sem utilizador: só a chave de serviço lê o interruptor e grava o estado (D-126).
  const bd = criarClienteServico();
  const { data: modulo } = await bd
    .from("modulos_plataforma")
    .select("ativo")
    .eq("chave", "pagamentos")
    .maybeSingle();
  const adaptador = adaptadorConfigurado();
  if (!modulo?.ativo || !adaptador) return naoExiste();
  const evento = adaptador.lerWebhook(await pedido.text(), pedido.headers.get("x-assinatura"));
  if (!evento) return new Response(null, { status: 401 });
  await bd
    .from("pagamentos")
    .update({ estado: evento.estado, atualizado_em: new Date().toISOString() })
    .eq("id_externo", evento.idExterno)
    .neq("estado", evento.estado);
  return new Response(null, { status: 200 });
}
