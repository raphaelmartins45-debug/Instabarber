import { z } from "zod";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";

// Condições comerciais (D-161). O mesmo esquema valida o formulário e a ação.

const percentagem = z.coerce
  .number()
  .int("percentagem")
  .min(0, "percentagem")
  .max(100, "percentagem");

export const esquemaCondicoes = z.object({
  descontosAtivos: z.boolean(),
  descontoMaxMensalidade: percentagem,
  taxaAtiva: z.boolean(),
  taxaBase: z
    .string()
    .trim()
    .refine((v) => centimosDeTexto(v) !== null, "valor")
    .transform((v) => centimosDeTexto(v)!),
  descontoMaxTaxa: percentagem,
});
export type DadosCondicoes = z.input<typeof esquemaCondicoes>;
