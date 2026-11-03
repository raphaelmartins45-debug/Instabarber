import { z } from "zod";

// Alterar uma campanha comercial (D-190): ligar, data de fim, vagas, nome e texto. O mesmo
// esquema valida o formulário e a ação; o que a campanha oferece não muda pelo ecrã.

export const esquemaCampanha = z.object({
  ativa: z.boolean(),
  nome: z.string().trim().min(3, "nome").max(80, "nome"),
  texto: z.string().trim().min(10, "texto").max(600, "texto"),
  valida_ate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data")]),
  vagas: z.union([z.literal(""), z.string().regex(/^[1-9]\d{0,4}$/, "vagas")]),
});
export type DadosCampanha = z.input<typeof esquemaCampanha>;
