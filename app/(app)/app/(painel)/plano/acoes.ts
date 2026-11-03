"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { avisarComprovativo, valorEsperadoCent } from "@/lib/admin/comprovativos";
import { origemDoPedido, origemPrincipal } from "@/lib/inquilino/endereco";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { enviarComprovativo, obterComprovativo } from "@/lib/repositorios/comprovativos";
import { listarFaturas } from "@/lib/repositorios/admin/pagamentos";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// O dono envia o comprovativo da mensalidade (D-168), também com a barbearia suspensa (M.4): por
// isso não passa por exigirGestor. Os administradores e o comercial do lead também (D-196), na
// ficha do lead. A função SQL verifica quem envia, o ficheiro e o período.

const esquema = z.object({
  inquilinoId: z.guid(),
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
  // O aviso à InstaBarber lê dados que o comercial do lead não vê (D-196): sem eles, não há e-mail,
  // mas o comprovativo fica registado e aparece no painel do Admin, nos pendentes.
  try {
    const [b, c, faturas] = await Promise.all([
      obterConfiguracao(bd, v.data.inquilinoId),
      obterComprovativo(bd, r.id),
      listarFaturas(bd, v.data.inquilinoId),
    ]);
    if (c) {
      const f = faturas.find((x) => x.id === c.fatura_id);
      const origem = (await origemPrincipal()) || (await origemDoPedido());
      const v = await valorEsperadoCent(bd, b, c.periodo_inicio);
      await avisarComprovativo(
        b,
        c,
        f?.numero ?? null,
        `${origem}/admin/pagamentos/comprovativos/${c.id}`,
        f?.valor_centimos ?? v.mensalidade + v.implementacao,
      );
    }
  } catch (erro) {
    console.error(
      "aviso_comprovativo_falhou",
      erro instanceof Error ? erro.message : "desconhecido",
    );
  }
  revalidatePath("/app/plano");
  revalidatePath("/app/suspensa");
  return { ok: true };
}
