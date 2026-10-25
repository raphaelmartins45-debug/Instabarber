import { NextResponse } from "next/server";
import { baseDeDadosResponde } from "@/lib/repositorios/saude";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Saúde do serviço (D-156): 200 quando a aplicação e a base de dados respondem, 503 quando não.
// Consultada de minutos a minutos pela monitorização da disponibilidade (objetivo de 99,5 %).
// Não devolve dados nem detalhes do erro.

export const dynamic = "force-dynamic";

export async function GET() {
  let ok = false;
  try {
    ok = await baseDeDadosResponde(await criarClienteServidor());
  } catch {
    ok = false;
  }
  return NextResponse.json(
    { ok },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
