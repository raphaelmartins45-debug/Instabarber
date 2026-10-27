"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { mudarMeuConsentimentoFotos } from "@/lib/repositorios/meu-historico";
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

/** O cliente dá ou retira o consentimento das fotografias do histórico de cortes (D-179). */
export async function mudarConsentimentoFotos(
  inquilinoId: string,
  sim: boolean,
): Promise<{ ok: boolean }> {
  if (!z.string().uuid().safeParse(inquilinoId).success) return { ok: false };
  const ok = await mudarMeuConsentimentoFotos(await criarClienteServidor(), inquilinoId, !!sim);
  revalidatePath("/", "layout");
  return { ok };
}
