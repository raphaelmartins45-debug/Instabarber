"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cancelarMinhaMarcacao } from "@/lib/repositorios/minha-area";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** O cliente cancela a sua marcação até à antecedência da barbearia (cancelar_minha_marcacao). */
export async function cancelarMarcacao(
  id: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (!z.string().uuid().safeParse(id).success) return { ok: false, erro: "erro" };
  const r = await cancelarMinhaMarcacao(await criarClienteServidor(), id);
  revalidatePath("/", "layout");
  return r.ok ? { ok: true } : { ok: false, erro: r.motivo };
}
