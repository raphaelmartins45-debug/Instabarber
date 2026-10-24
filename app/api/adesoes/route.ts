import { NextResponse } from "next/server";
import { avisoNovaAdesao } from "@/lib/email/adesao";
import { enviarEmail } from "@/lib/email/enviar";
import { ipDoPedido, origemDoPedido } from "@/lib/inquilino/endereco";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { paraSubmissao, precoDoPedido } from "@/lib/regras/pedido-adesao";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { submeterPedidoAdesao, usarConviteAdesao } from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaPedidoAdesao } from "@/lib/validacao/adesao";

// Pedido de adesão (D.8, D.8.2): limite por IP e por e-mail, campo-isco, submeter_pedido_adesao()
// convite do Comercial (N.7) e aviso curto à Performa LAB. Não se cria conta nenhuma até à aprovação.

const TAMANHO_MAXIMO = 40_000;

export async function POST(pedido: Request) {
  const corpo = await pedido.text();
  if (corpo.length > TAMANHO_MAXIMO) return NextResponse.json({ erro: "grande" }, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(corpo);
  } catch {
    return NextResponse.json({ erro: "invalido" }, { status: 400 });
  }
  const v = esquemaPedidoAdesao.safeParse(json);
  if (!v.success) {
    return NextResponse.json(
      { erro: "invalido", campos: v.error.issues.map((i) => i.path.join(".")) },
      { status: 400 },
    );
  }
  // Campo-isco preenchido: responde como se tivesse corrido bem e não grava nada.
  if (v.data.website) return NextResponse.json({ ok: true });

  const servico = criarClienteServico();
  const ip = await ipDoPedido();
  const email = v.data.contratacao.email_acesso;
  const dentro =
    (await consumirLimite(servico, `adesao:ip:${ip}`, LIMITES.adesaoIp)) &&
    (await consumirLimite(servico, `adesao:email:${email}`, LIMITES.adesaoEmail));
  if (!dentro) return NextResponse.json({ erro: "limite" }, { status: 429 });

  const bd = await criarClienteServidor();
  const id = await submeterPedidoAdesao(bd, paraSubmissao(v.data));
  if (!id) return NextResponse.json({ erro: "envio" }, { status: 502 });
  // Veio por convite do Comercial (N.7): o pedido fica ligado ao contrato assinado. Um convite
  // inválido não impede o pedido; só não fica ligado.
  if (v.data.convite) await usarConviteAdesao(bd, v.data.convite, id);

  const preco = precoDoPedido(v.data, lerRegimeIva(process.env.PRESTADORA_REGIME_IVA));
  const ligacao = `${await origemDoPedido()}/admin/pedidos/${id}`;
  // A falha do aviso não desfaz o pedido: fica no separador Pedidos.
  await enviarEmail(() => avisoNovaAdesao(v.data, preco, ligacao));
  return NextResponse.json({ ok: true, id });
}
