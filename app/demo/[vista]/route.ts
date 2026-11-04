import { NextResponse, type NextRequest } from "next/server";
import { entradaDemonstracao } from "@/lib/admin/contas-demonstracao";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { enderecoDemonstracao } from "@/lib/admin/endereco-demonstracao";
import { obterDemonstracao } from "@/lib/repositorios/admin/demonstracao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// As vistas da demonstração (D-207): /demo/publica abre a página pública; /demo/gestor e
// /demo/barbeiro, só para a equipa da InstaBarber, abrem o painel no endereço da demonstração
// com uma entrada de uso único, sem tocar na sessão de quem está a mostrar.

export async function GET(pedido: NextRequest, { params }: { params: Promise<{ vista: string }> }) {
  const { vista } = await params;
  if (!["publica", "gestor", "barbeiro"].includes(vista)) {
    return NextResponse.redirect(new URL("/demo", pedido.url));
  }
  const demo = await obterDemonstracao(await criarClienteServidor());
  if (!demo) return NextResponse.redirect(new URL("/demo?erro=sem-demo", pedido.url));
  const endereco = await enderecoDemonstracao(demo.slug);
  if (vista === "publica") return NextResponse.redirect(endereco);

  // Sem sessão, entra primeiro e volta a esta vista.
  const {
    data: { user },
  } = await (await criarClienteServidor()).auth.getUser();
  if (!user) {
    const entrar = new URL("/entrar", pedido.url);
    entrar.searchParams.set("seguinte", `/demo/${vista}`);
    return NextResponse.redirect(entrar);
  }
  await exigirEquipaPlataforma();
  const token = await entradaDemonstracao(vista as "gestor" | "barbeiro");
  if (!token) return NextResponse.redirect(new URL("/demo?erro=entrada", pedido.url));
  const destino = new URL("/api/demo/entrar", endereco);
  destino.searchParams.set("token_hash", token);
  return NextResponse.redirect(destino);
}
