"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import { mesmoDiaMesSeguinte } from "@/lib/formatacao/datas";
import { criarConta, marcarPaga, removerConta } from "@/lib/repositorios/painel/financeiro";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaConta } from "@/lib/validacao/financeiro";

// Financeiro da barbearia (E.2): só o gestor.

export type Resultado = { ok: true } | { ok: false; erro: string };

const tipo = z.enum(["custo", "despesa"]);
const uuid = z.string().uuid();

function revalidar() {
  revalidatePath("/app", "layout");
}

export async function paguei(t: string, id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = z.object({ t: tipo, id: uuid }).safeParse({ t, id });
  if (!v.success) return { ok: false, erro: "erro" };
  const ok = await marcarPaga(
    await criarClienteServidor(),
    contexto.barbearia.id,
    v.data.t,
    v.data.id,
    mesmoDiaMesSeguinte,
  );
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function remover(t: string, id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = z.object({ t: tipo, id: uuid }).safeParse({ t, id });
  if (!v.success) return { ok: false, erro: "erro" };
  const ok = await removerConta(
    await criarClienteServidor(),
    contexto.barbearia.id,
    v.data.t,
    v.data.id,
  );
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function novaConta(dados: z.input<typeof esquemaConta>): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaConta.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const ok = await criarConta(await criarClienteServidor(), contexto.barbearia.id, {
    tipo: v.data.tipo,
    descricao: v.data.descricao,
    valorCent: v.data.valor,
    data: v.data.data,
    recorrente: v.data.recorrente,
    categoria: v.data.categoria,
  });
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}
