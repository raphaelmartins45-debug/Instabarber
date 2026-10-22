import { z } from "zod";

// Contadores da landing (D-50): visitas, abertura da calculadora e cliques em «Continuar».
// Sem cookies, sem IP e sem dados pessoais: só o nome do evento. Até haver base de dados
// (Fase 3B), cada evento fica como uma linha estruturada nos registos da Vercel.

const esquemaEvento = z.object({ evento: z.enum(["visita", "calculadora", "continuar"]) });

export async function POST(pedido: Request) {
  const corpo = await pedido.text();
  if (corpo.length > 200) return new Response(null, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(corpo);
  } catch {
    return new Response(null, { status: 400 });
  }
  const validado = esquemaEvento.safeParse(json);
  if (!validado.success) return new Response(null, { status: 400 });

  console.info(JSON.stringify({ medicao: validado.data.evento }));
  return new Response(null, { status: 204 });
}
