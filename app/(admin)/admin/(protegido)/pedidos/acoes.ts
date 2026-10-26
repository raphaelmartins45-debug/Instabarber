"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { aprovarPedido, rejeitarPedido, type ResultadoAprovacao } from "@/lib/admin/aprovacao";

// Decisão sobre um pedido de adesão (E.1). A validação é a mesma do formulário de ajuste.

const esquemaAjustes = z.object({
  slug: z.string().trim().toLowerCase().max(40).optional(),
  plano: z.enum(["basic", "pro"]).optional(),
  periodicidade: z.enum(["mensal", "anual"]).optional(),
  profissionais: z.number().int().min(1).max(200).optional(),
});

export async function aprovar(
  pedidoId: string,
  ajustes: z.input<typeof esquemaAjustes>,
): Promise<ResultadoAprovacao> {
  const id = z.string().uuid().safeParse(pedidoId);
  const a = esquemaAjustes.safeParse(ajustes);
  if (!id.success || !a.success) return { ok: false, erro: "falhou" };
  const r = await aprovarPedido(id.data, { ...a.data, slug: a.data.slug || undefined });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return r;
}

export async function rejeitar(pedidoId: string, motivo: string): Promise<{ ok: boolean }> {
  const id = z.string().uuid().safeParse(pedidoId);
  const m = z.string().trim().min(3).max(600).safeParse(motivo);
  if (!id.success || !m.success) return { ok: false };
  const ok = await rejeitarPedido(id.data, m.data);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return { ok };
}
