import { z } from "zod";
import { telefoneE164 } from "@/lib/formatacao/telefone";

// Dados da marcação pública (E.4). O mesmo esquema valida o formulário e a Server Action.

const vazio = (v: string) => (v.trim() === "" ? null : v.trim());

export const esquemaDadosMarcacao = z.object({
  nome: z.string().trim().min(1, "nome").max(80, "nome"),
  telefone: z.string().transform((v, ctx) => {
    const e = telefoneE164(v);
    if (!e) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telefone" });
    return e ?? "";
  }),
  email: z.union([z.string().trim().email("email").max(120), z.literal("")]).transform(vazio),
  nascimento: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]).transform(vazio),
  convite: z
    .string()
    .trim()
    .max(6)
    .transform((v) => vazio(v)?.toUpperCase() ?? null),
  consentimento: z.boolean(),
  palavraPasse: z
    .union([z.string().min(8, "palavra_passe_curta").max(72), z.literal("")])
    .transform(vazio),
});
