"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import {
  alternarPromocao,
  criarPromocao,
  removerPromocao,
} from "@/lib/repositorios/painel/promocoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaPromocao } from "@/lib/validacao/sistema";

// Promoções da página pública, na Gestão do sistema. A RLS confere outra vez que é o proprietário.

type Resultado = { ok: true } | { ok: false; erro: string };
const uuid = z.string().uuid();

function revalidar(slug: string) {
  revalidatePath("/app", "layout");
  revalidatePath(`/b/${slug}`);
}

export async function novaPromocao(dados: z.input<typeof esquemaPromocao>): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaPromocao.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const ok = await criarPromocao(await criarClienteServidor(), contexto.barbearia.id, v.data);
  revalidar(contexto.barbearia.slug);
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function mudarPromocao(id: string, ativa: boolean): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await alternarPromocao(
    await criarClienteServidor(),
    contexto.barbearia.id,
    id,
    !!ativa,
  );
  revalidar(contexto.barbearia.slug);
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function apagarPromocao(id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await removerPromocao(await criarClienteServidor(), contexto.barbearia.id, id);
  revalidar(contexto.barbearia.slug);
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}
