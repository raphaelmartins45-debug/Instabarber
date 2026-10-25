"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { marcarComissaoPaga, registarTaxaPaga } from "@/lib/repositorios/comercial/comissoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Comissões dos comerciais (D-162): só o dono e o gestor registam; a base de dados confere.

const dados = z.object({
  id: z.string().uuid(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passo: z.enum(["taxa", "paga"]),
});

export async function registarComissao(
  id: string,
  passo: "taxa" | "paga",
  data: string,
): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  const v = dados.safeParse({ id, data, passo });
  if (!v.success) return { ok: false };
  const bd = await criarClienteServidor();
  const ok =
    v.data.passo === "taxa"
      ? await registarTaxaPaga(bd, v.data.id, v.data.data)
      : await marcarComissaoPaga(bd, v.data.id, v.data.data);
  revalidatePath("/admin/comercial/desempenho");
  revalidatePath("/admin");
  return { ok };
}
