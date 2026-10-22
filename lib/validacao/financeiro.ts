import { z } from "zod";
import { valorEuros } from "./agenda";

// Financeiro (E.2): o mesmo esquema valida o formulário e a Server Action.

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data");

export const esquemaConta = z.object({
  tipo: z.enum(["custo", "despesa"]),
  descricao: z.string().trim().min(1, "descricao").max(120, "descricao"),
  valor: valorEuros,
  data,
  recorrente: z.boolean().default(true),
  categoria: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => v || null),
});

export const esquemaObjetivo = z.object({
  profissionalId: z.union([z.string().uuid(), z.literal("")]).transform((v) => v || null),
  mes: z.string().regex(/^\d{4}-\d{2}-01$/, "data"),
  valor: valorEuros,
});

export const esquemaAcerto = z.object({
  profissionalId: z.string().uuid(),
  mes: z.string().regex(/^\d{4}-\d{2}-01$/, "data"),
  data,
  metodo: z.enum(["dinheiro", "mbway", "transferencia"]),
  valor: valorEuros,
  nota: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => v || null),
});
