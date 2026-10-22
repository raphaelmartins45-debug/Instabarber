import { z } from "zod";
import { telefoneE164 } from "@/lib/formatacao/telefone";

// Entrada da equipa, palavra-passe, segundo fator e acesso do cliente (B.6, F.9).
// Os mesmos esquemas validam o formulário (React Hook Form) e a Server Action ou rota.
// As mensagens são códigos; o texto vem de lib/i18n.

const email = z.string().trim().toLowerCase().max(160).email("email_invalido");
const palavraPasse = z.string().min(8, "palavra_passe_curta").max(72, "palavra_passe_longa");
const telemovel = z
  .string()
  .max(30)
  .transform((v, ctx) => {
    const e164 = telefoneE164(v);
    if (!e164) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "telemovel_invalido" });
    return e164 ?? "";
  });

export const esquemaEntradaEquipa = z.object({
  email,
  palavra_passe: z.string().min(1, "obrigatorio").max(72),
  seguinte: z.string().max(300).optional(),
});

export const esquemaRecuperar = z.object({ email });

export const esquemaDefinirPalavraPasse = z
  .object({ palavra_passe: palavraPasse, repetir: z.string() })
  .refine((v) => v.palavra_passe === v.repetir, { message: "diferentes", path: ["repetir"] });

export const esquemaCodigoTotp = z.object({
  fator: z.string().uuid(),
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "codigo_invalido"),
});

export const esquemaEntradaCliente = z.object({
  telefone: telemovel,
  palavra_passe: z.string().min(1, "obrigatorio").max(72),
});

export const esquemaPedirCodigo = z.object({ telefone: telemovel });

export const esquemaCriarAcesso = z.object({
  telefone: telemovel,
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "codigo_invalido"),
  palavra_passe: palavraPasse,
});

export type DadosEntradaEquipa = z.input<typeof esquemaEntradaEquipa>;
export type DadosDefinirPalavraPasse = z.input<typeof esquemaDefinirPalavraPasse>;
export type DadosEntradaCliente = z.input<typeof esquemaEntradaCliente>;
export type DadosCriarAcesso = z.input<typeof esquemaCriarAcesso>;
