import { NextResponse } from "next/server";
import { avisoComercialFase1, avisoComercialFase2, respostaVisitante } from "@/lib/email/contacto";
import { enviarEmail } from "@/lib/email/enviar";
import { ipDoPedido } from "@/lib/inquilino/endereco";
import { gravarLeadDoSite } from "@/lib/repositorios/comercial/site";
import { esquemaContacto, gerarRef } from "@/lib/validacao/contacto";

// Pedido de contacto da landing (D-46, D-50): fica no CRM (submeter_lead, N.3, D-146) e avisa o
// comercial@ pelo Resend. Com o limite por IP esgotado, recusa sem gravar nem enviar.

const TAMANHO_MAXIMO = 8_000;

export async function POST(pedido: Request) {
  const corpo = await pedido.text();
  if (corpo.length > TAMANHO_MAXIMO)
    return NextResponse.json({ ok: false, erro: "grande" }, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(corpo);
  } catch {
    return NextResponse.json({ ok: false, erro: "invalido" }, { status: 400 });
  }

  const validado = esquemaContacto.safeParse(json);
  if (!validado.success) {
    return NextResponse.json(
      { ok: false, erro: "invalido", campos: validado.error.issues.map((i) => i.path.join(".")) },
      { status: 400 },
    );
  }
  const dados = validado.data;

  // Campo-isco preenchido: responde como se tivesse corrido bem e não envia nada.
  if (dados.website)
    return NextResponse.json({ ok: true, ...(dados.fase === 1 ? { ref: gerarRef() } : {}) });

  if ((await gravarLeadDoSite(await ipDoPedido(), dados)) === "limite_ip")
    return NextResponse.json({ ok: false, erro: "limite" }, { status: 429 });

  if (dados.fase === 1) {
    const ref = gerarRef();
    if (!(await enviarEmail(() => avisoComercialFase1(ref, dados)))) {
      return NextResponse.json({ ok: false, erro: "envio" }, { status: 502 });
    }
    // A resposta automática não decide o resultado: o pedido já chegou ao comercial.
    await enviarEmail(() => respostaVisitante(ref, dados));
    return NextResponse.json({ ok: true, ref });
  }

  if (!(await enviarEmail(() => avisoComercialFase2(dados)))) {
    return NextResponse.json({ ok: false, erro: "envio" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
