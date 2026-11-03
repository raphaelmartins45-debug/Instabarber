import { NextResponse, type NextRequest } from "next/server";
import { telefoneApoio } from "@/lib/apoio/contacto";

// Atalho «Ligar» para o apoio (D-197), usado pela página de erro, que corre no navegador e não lê
// a configuração. No telemóvel abre a chamada.

export function GET(pedido: NextRequest) {
  const telefone = telefoneApoio();
  return NextResponse.redirect(telefone ? `tel:${telefone.e164}` : new URL("/", pedido.url));
}
