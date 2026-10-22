"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { obterContextoEquipa } from "@/lib/equipa/contexto";
import { marcarCodigoEnviado } from "@/lib/repositorios/codigos-acesso";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** «Já enviei»: a equipa confirma à mão que mandou o código pelo WhatsApp (regra 7). */
export async function confirmarEnvioCodigo(id: string): Promise<{ ok: boolean }> {
  const v = z.string().uuid().safeParse(id);
  if (!v.success) return { ok: false };
  const { barbearia } = await obterContextoEquipa();
  const ok = await marcarCodigoEnviado(await criarClienteServidor(), barbearia.id, v.data);
  revalidatePath("/app");
  return { ok };
}
