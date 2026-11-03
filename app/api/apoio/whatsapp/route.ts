import { NextResponse, type NextRequest } from "next/server";
import { telefoneApoio } from "@/lib/apoio/contacto";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";

// Atalho para o WhatsApp do apoio (D-197), usado pelas páginas de erro: o número fica na
// configuração do servidor. A mensagem vai preparada; quem envia é a pessoa (regra 7).

export function GET(pedido: NextRequest) {
  const telefone = telefoneApoio();
  if (!telefone) return NextResponse.redirect(new URL("/", pedido.url));
  return NextResponse.redirect(
    ligacaoWhatsApp(telefone.e164, textos.paineis.indisponivel.mensagemWhatsapp),
  );
}
