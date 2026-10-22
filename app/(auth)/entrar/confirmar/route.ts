import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Ligação dos e-mails de convite e de recuperação (B9): troca o token_hash por uma sessão
// e abre o ecrã para definir a palavra-passe. A palavra-passe nunca viaja no e-mail.

const TIPOS: EmailOtpType[] = ["invite", "recovery"];

export async function GET(pedido: NextRequest) {
  const tokenHash = pedido.nextUrl.searchParams.get("token_hash");
  const tipo = pedido.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const prefixo = (await lerEndereco()).slug ? "/app" : "";
  const destino = new URL(`${prefixo}/entrar/definir`, pedido.url);

  if (tokenHash && tipo && TIPOS.includes(tipo)) {
    const bd = await criarClienteServidor();
    const { error } = await bd.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
    if (!error) return NextResponse.redirect(destino);
  }
  destino.searchParams.set("erro", "ligacao");
  return NextResponse.redirect(destino);
}
