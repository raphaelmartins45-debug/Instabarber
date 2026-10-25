"use server";

import { revalidatePath } from "next/cache";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { guardarMetaComercial } from "@/lib/repositorios/comercial/desempenho";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { type DadosMetaComercial, esquemaMetaComercial } from "@/lib/validacao/desempenho";

// Metas dos comerciais (D-161): só o dono e o gestor; o RLS volta a verificar.

export async function guardarMeta(dados: DadosMetaComercial): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  const v = esquemaMetaComercial.safeParse(dados);
  if (!v.success) return { ok: false };
  const { userId, mes, ...meta } = v.data;
  const ok = await guardarMetaComercial(await criarClienteServidor(), userId, mes, meta);
  revalidatePath("/admin/comercial/desempenho");
  return { ok };
}
