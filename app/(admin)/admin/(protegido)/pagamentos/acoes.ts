"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { criarFatura, registarRecebimento } from "@/lib/repositorios/admin/pagamentos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Faturas da Performa LAB (emitidas no seu programa certificado) e recebimentos, registados à mão.

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data");
const valor = z.string().transform((v, ctx) => {
  const c = centimosDeTexto(v);
  if (c === null || c <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "valor" });
  return c ?? 0;
});

const esquemaFatura = z
  .object({
    inquilino_id: z.string().uuid(),
    numero: z.string().trim().min(1, "numero").max(40),
    valor,
    periodo_inicio: data,
    periodo_fim: data,
    emitida_em: data,
  })
  .refine((f) => f.periodo_inicio <= f.periodo_fim, { message: "periodo", path: ["periodo_fim"] });

const esquemaRecebimento = z.object({
  inquilino_id: z.string().uuid(),
  fatura_id: z.union([z.string().uuid(), z.literal("")]).transform((v) => v || null),
  valor,
  metodo: z.enum(["dinheiro", "mbway", "transferencia"]),
  data,
  nota: z
    .string()
    .trim()
    .max(300)
    .transform((v) => v || null),
});

export async function registarFatura(
  dados: z.input<typeof esquemaFatura>,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  await exigirSuperAdmin();
  const v = esquemaFatura.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "numero" };
  const { valor: valorCent, ...resto } = v.data;
  const r = await criarFatura(await criarClienteServidor(), {
    ...resto,
    valor_centimos: valorCent,
  });
  revalidatePath("/admin/pagamentos");
  revalidatePath(`/admin/barbearias/${v.data.inquilino_id}/pagamentos`);
  return r.ok ? { ok: true } : { ok: false, erro: r.repetido ? "repetido" : "numero" };
}

export async function registarPagamento(
  dados: z.input<typeof esquemaRecebimento>,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const admin = await exigirSuperAdmin();
  const v = esquemaRecebimento.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "valor" };
  const { valor: valorCent, ...resto } = v.data;
  const ok = await registarRecebimento(await criarClienteServidor(), {
    ...resto,
    valor_centimos: valorCent,
    registadoPor: admin.userId,
  });
  revalidatePath("/admin/pagamentos");
  revalidatePath(`/admin/barbearias/${v.data.inquilino_id}/pagamentos`);
  return ok ? { ok: true } : { ok: false, erro: "valor" };
}
