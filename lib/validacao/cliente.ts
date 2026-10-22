import { z } from "zod";
import { telefoneE164 } from "@/lib/formatacao/telefone";

// Dados do cliente na ficha (E.2). O mesmo esquema valida o formulário e a Server Action.

const vazioParaNulo = (v: string) => (v.trim() === "" ? null : v.trim());

export const esquemaDadosCliente = z.object({
  nome: z.string().trim().min(1, "nome").max(80, "nome"),
  telefone: z.string().transform((v, ctx) => {
    const e = telefoneE164(v);
    if (!e) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telefone" });
    return e ?? "";
  }),
  email: z.union([z.string().trim().email("email"), z.literal("")]).transform(vazioParaNulo),
  data_nascimento: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data"), z.literal("")])
    .transform(vazioParaNulo),
  nif: z.union([z.string().regex(/^\d{9}$/, "nif"), z.literal("")]).transform(vazioParaNulo),
  notas: z.string().max(1000, "notas").transform(vazioParaNulo),
  consentimento_mensagens: z.boolean(),
  nao_contactar: z.boolean(),
});

export const FOTO_FICHA = {
  tipos: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<
    string,
    string
  >,
  maxBytes: 3 * 1024 * 1024,
};
