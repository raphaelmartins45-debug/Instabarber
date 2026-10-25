"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import { marcarCodigoEnviado } from "@/lib/repositorios/codigos-acesso";
import { marcarComunicadoLido } from "@/lib/repositorios/painel/comunicados";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** «Já enviei»: a equipa confirma à mão que mandou o código pelo WhatsApp (regra 7). */
export async function confirmarEnvioCodigo(id: string): Promise<{ ok: boolean }> {
  const v = z.string().uuid().safeParse(id);
  if (!v.success) return { ok: false };
  const { barbearia } = await exigirGestorParaEscrever();
  const ok = await marcarCodigoEnviado(await criarClienteServidor(), barbearia.id, v.data);
  revalidatePath("/app");
  return { ok };
}

/** «Li» num comunicado da InstaBarber (D-160); a função na base de dados confere o gestor. */
export async function lerComunicado(id: string): Promise<{ ok: boolean }> {
  const v = z.string().uuid().safeParse(id);
  if (!v.success) return { ok: false };
  const { barbearia } = await exigirGestorParaEscrever();
  const ok = await marcarComunicadoLido(await criarClienteServidor(), v.data, barbearia.id);
  revalidatePath("/app");
  return { ok };
}
