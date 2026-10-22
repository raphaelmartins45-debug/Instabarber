import { z } from "zod";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { telefoneE164 } from "@/lib/formatacao/telefone";

// Agenda ao balcão (E.2). O mesmo esquema valida o formulário e a Server Action; as mensagens
// são códigos (textos.agenda.erros). A vaga e o preço decidem-se na base de dados.

const telefone = z.string().transform((v, ctx) => {
  const e = telefoneE164(v);
  if (!e) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telefone" });
  return e ?? "";
});

export const valorEuros = z.string().transform((v, ctx) => {
  const c = centimosDeTexto(v);
  if (c === null) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "valor" });
  return c ?? 0;
});

const valorOpcional = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v?.trim()) return null;
    const c = centimosDeTexto(v);
    if (c === null) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "valor" });
    return c;
  });

export const esquemaBalcao = z.object({
  modo: z.enum(["marcar", "registar"]),
  telefone,
  nome: z.string().trim().max(80).optional().default(""),
  consentimento: z.boolean().default(false),
  servicoId: z.string().uuid("servico_invalido"),
  profissionalId: z.string().uuid("profissional_invalido"),
  inicio: z.string().datetime({ offset: true, message: "hora" }),
  valor: valorOpcional,
});

export const esquemaConcluir = z
  .object({
    id: z.string().uuid(),
    modo: z.enum(["normal", "credito_clube", "premio"]),
    valor: valorOpcional,
    cartaoCodigo: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .transform((v) => v || null),
    cartaoValor: valorOpcional,
  })
  .refine((v) => !v.cartaoCodigo || (v.cartaoValor ?? 0) > 0, {
    message: "valor",
    path: ["cartaoValor"],
  });
