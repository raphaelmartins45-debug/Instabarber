"use server";

import { revalidatePath } from "next/cache";
import { registarBarbeariaNoPainel } from "@/lib/admin/registo";
import {
  type DadosRegistoBarbearia,
  esquemaRegistoBarbearia,
} from "@/lib/validacao/registo-barbearia";

// Registo de uma barbearia pelo painel (D-189): os administradores (dono e gestor).

export async function registar(
  dados: DadosRegistoBarbearia,
): Promise<{ ok: true; inquilinoId: string; emailEnviado: boolean } | { ok: false; erro: string }> {
  const v = esquemaRegistoBarbearia.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "generico" };
  const r = await registarBarbeariaNoPainel(v.data);
  revalidatePath("/admin/barbearias");
  return r.ok ? { ok: true, inquilinoId: r.inquilinoId, emailEnviado: r.emailEnviado } : r;
}
