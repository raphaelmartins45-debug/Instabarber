import { z } from "zod";

// Registo de um barbeiro novo pelo gestor (E.3). O NIF é opcional e nunca é palavra-passe.

export const esquemaRegistarBarbeiro = z.object({
  nome: z.string().trim().min(2, "nome").max(80, "nome"),
  email: z.string().trim().toLowerCase().max(160).email("email"),
  nif: z
    .string()
    .trim()
    .regex(/^(\d{9})?$/, "nif")
    .optional()
    .transform((v) => (v ? v : null)),
});

export type DadosRegistarBarbeiro = z.input<typeof esquemaRegistarBarbeiro>;
