"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { aplicarPacote, obterBarbearia } from "@/lib/repositorios/admin/barbearias";
import { guardarGrelha, lerGrelhaBarbearia } from "@/lib/repositorios/admin/grelha";
import { listarPacotes } from "@/lib/repositorios/funcionalidades";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Grelha de funcionalidades (D.3, D.4): só a Performa LAB liga e desliga. Fora do plano, ligada
// = bónus (não altera o preço). O gatilho auditar_interruptor regista cada alteração.

const esquema = z.object({
  inquilinoId: z.string().uuid(),
  ativas: z.array(z.object({ chave: z.string().regex(/^[a-z_]+$/), ativa: z.boolean() })).max(100),
});

export async function guardarFuncionalidades(
  dados: z.input<typeof esquema>,
): Promise<{ ok: boolean }> {
  const admin = await exigirSuperAdmin();
  const v = esquema.safeParse(dados);
  if (!v.success) return { ok: false };
  const bd = await criarClienteServidor();
  const barbearia = await obterBarbearia(bd, v.data.inquilinoId);
  if (!barbearia) return { ok: false };
  const doPlano = new Set((await listarPacotes(bd))[barbearia.plano as "basic" | "pro"]);
  const atuais = new Map(
    (await lerGrelhaBarbearia(bd, v.data.inquilinoId)).map((l) => [l.chave, l]),
  );
  const alteracoes = v.data.ativas
    .filter((a) => atuais.get(a.chave)?.ativa !== a.ativa)
    .map((a) => ({ chave: a.chave, ativa: a.ativa, bonus: a.ativa && !doPlano.has(a.chave) }));
  const ok = await guardarGrelha(bd, v.data.inquilinoId, alteracoes, admin.userId);
  revalidatePath("/admin/funcionalidades");
  revalidatePath(`/admin/barbearias/${v.data.inquilinoId}`, "layout");
  return { ok };
}

export async function reporPacote(inquilinoId: string): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  if (!z.string().uuid().safeParse(inquilinoId).success) return { ok: false };
  const ok = await aplicarPacote(await criarClienteServidor(), inquilinoId);
  revalidatePath("/admin/funcionalidades");
  revalidatePath(`/admin/barbearias/${inquilinoId}`, "layout");
  return { ok };
}
