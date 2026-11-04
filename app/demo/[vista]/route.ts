import { NextResponse, type NextRequest } from "next/server";
import { temAcessoDemonstracao } from "@/lib/admin/acesso-demonstracao";
import { entradaDemonstracao } from "@/lib/admin/contas-demonstracao";
import { enderecoDemonstracao } from "@/lib/admin/endereco-demonstracao";
import { obterDemonstracao } from "@/lib/repositorios/admin/demonstracao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// As vistas da demonstração (D-207, D-208): só com o código de acesso da reunião. /demo/publica
// abre a página pública; /demo/gestor e /demo/barbeiro abrem o painel no endereço da
// demonstração com uma entrada de uso único, sem palavra-passe e sem tocar noutra sessão.

export async function GET(pedido: NextRequest, { params }: { params: Promise<{ vista: string }> }) {
  const { vista } = await params;
  if (!["publica", "gestor", "barbeiro"].includes(vista) || !(await temAcessoDemonstracao())) {
    return NextResponse.redirect(new URL("/demo", pedido.url));
  }
  const demo = await obterDemonstracao(await criarClienteServidor());
  if (!demo) return NextResponse.redirect(new URL("/demo?erro=sem-demo", pedido.url));
  const endereco = await enderecoDemonstracao(demo.slug);
  if (vista === "publica") return NextResponse.redirect(endereco);

  const token = await entradaDemonstracao(vista as "gestor" | "barbeiro");
  if (!token) return NextResponse.redirect(new URL("/demo?erro=entrada", pedido.url));
  const destino = new URL("/api/demo/entrar", endereco);
  destino.searchParams.set("token_hash", token);
  return NextResponse.redirect(destino);
}
