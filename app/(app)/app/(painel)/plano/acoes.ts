"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { avisarComprovativo } from "@/lib/admin/comprovativos";
import { origemDoPedido, origemPrincipal } from "@/lib/inquilino/endereco";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { enviarComprovativo, obterComprovativo } from "@/lib/repositorios/comprovativos";
import { listarFaturas } from "@/lib/repositorios/admin/pagamentos";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// O dono envia o comprovativo da mensalidade (D-168), também com a barbearia suspensa (M.4): por
// isso não passa por exigirGestor. A função SQL verifica o proprietário, o ficheiro e o período.

const esquema = z.object({
  inquilinoId: z.string().uuid(),
  metodo: z.enum(["mbway", "transferencia"], { message: "metodo" }),
  valor: z
    .string()
    .transform((v) => centimosDeTexto(v))
    .refine((v): v is number => v !== null && v > 0, { message: "valor" }),
  pagoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "data" }),
  caminho: z.string().max(200),
});

export async function registarComprovativo(
  dados: z.input<typeof esquema>,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const v = esquema.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "generico" };
  const bd = await criarClienteServidor();
  const r = await enviarComprovativo(bd, { ...v.data, valorCent: v.data.valor });
  if (!r.ok) return { ok: false, erro: r.erro };
  const [b, c, faturas] = await Promise.all([
    obterConfiguracao(bd, v.data.inquilinoId),
    obterComprovativo(bd, r.id),
    listarFaturas(bd, v.data.inquilinoId),
  ]);
  if (c) {
    const fatura = faturas.find((f) => f.id === c.fatura_id)?.numero ?? null;
    const origem = (await origemPrincipal()) || (await origemDoPedido());
    await avisarComprovativo(b, c, fatura, `${origem}/admin/pagamentos/comprovativos/${c.id}`);
  }
  revalidatePath("/app/plano");
  revalidatePath("/app/suspensa");
  return { ok: true };
}
