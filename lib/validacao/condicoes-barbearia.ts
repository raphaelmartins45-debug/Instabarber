import { z } from "zod";
import { IMPLEMENTACOES } from "@/lib/comercial/condicoes";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";

// Cortesia e implementação de uma barbearia (D-189). O mesmo esquema valida o formulário do
// Admin e a ação; a base de dados confere outra vez (definir_cortesia, definir_implementacao).

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data");

export const esquemaCortesia = z
  .object({ ativa: z.boolean(), ate: z.union([z.literal(""), data]) })
  .refine((v) => v.ativa || v.ate === "", { message: "data", path: ["ate"] });
export type DadosCortesia = z.input<typeof esquemaCortesia>;

export const esquemaImplementacao = z
  .object({
    tipo: z.enum(IMPLEMENTACOES),
    valor: z
      .string()
      .trim()
      .refine((v) => centimosDeTexto(v || "0") !== null, "valor")
      .transform((v) => centimosDeTexto(v || "0")!),
  })
  .refine((v) => v.tipo !== "nenhuma" || v.valor === 0, { message: "valor", path: ["valor"] });
export type DadosImplementacao = z.input<typeof esquemaImplementacao>;
