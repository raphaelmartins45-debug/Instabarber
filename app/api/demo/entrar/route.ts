import { NextResponse, type NextRequest } from "next/server";
import { lerEndereco } from "@/lib/inquilino/endereco";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// A entrada de uso único nos painéis da demonstração (D-207): só no endereço da barbearia de
// demonstração. Troca o token por uma sessão da conta de demonstração e abre o painel (o do
// gestor, ou o do barbeiro, conforme a conta).

export async function GET(pedido: NextRequest) {
  const { slug } = await lerEndereco();
  if (slug !== "demonstracao") return new NextResponse(null, { status: 404 });
  const tokenHash = pedido.nextUrl.searchParams.get("token_hash");
  if (tokenHash) {
    const bd = await criarClienteServidor();
    await bd.auth.signOut();
    const { error } = await bd.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
    if (!error) return NextResponse.redirect(new URL("/app", pedido.url));
  }
  return NextResponse.redirect(new URL("/", pedido.url));
}
