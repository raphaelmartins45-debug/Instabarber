"use server";

import { revalidatePath } from "next/cache";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { guardarCondicoes } from "@/lib/repositorios/comercial/condicoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { type DadosCondicoes, esquemaCondicoes } from "@/lib/validacao/condicoes";

// Condições comerciais (D-161): só os administradores (dono e gestor); o RLS volta a verificar.

export async function guardar(
  dados: DadosCondicoes,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const { userId } = await exigirSuperAdmin();
  const v = esquemaCondicoes.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "generico" };
  const { taxaBase, ...resto } = v.data;
  const ok = await guardarCondicoes(
    await criarClienteServidor(),
    { ...resto, taxaBaseCent: taxaBase },
    userId,
  );
  revalidatePath("/admin/comercial", "layout");
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}
