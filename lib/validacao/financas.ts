import { z } from "zod";
import { CATEGORIAS, PERIODICIDADES, TIPOS } from "@/lib/financas/custos";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";

// Validação das Finanças da Performa LAB (O.4). O mesmo esquema valida o formulário e a ação.

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data");
const dataOpcional = z.union([z.literal(""), data]).default("");
const euros = z
  .string()
  .trim()
  .refine((v) => centimosDeTexto(v) !== null, "valor")
  .transform((v) => centimosDeTexto(v)!);
const nota = z.string().trim().max(400).default("");

export const esquemaCusto = z
  .object({
    descricao: z.string().trim().min(1, "descricao").max(160),
    categoria: z.enum(CATEGORIAS),
    tipo: z.enum(TIPOS),
    valor_sem_iva: euros,
    periodicidade: z.enum(PERIODICIDADES),
    data_inicio: data,
    data_fim: dataOpcional,
    nota,
  })
  .refine((c) => !c.data_fim || c.data_fim >= c.data_inicio, {
    message: "fim",
    path: ["data_fim"],
  });
export type DadosCusto = z.input<typeof esquemaCusto>;
export type CustoValidado = z.output<typeof esquemaCusto>;

export const esquemaConta = z
  .object({
    fornecedor: z.string().trim().min(1, "fornecedor").max(160),
    descricao: z.string().trim().max(200).default(""),
    valor_sem_iva: euros,
    valor_com_iva: euros,
    vencimento: data,
    nota,
  })
  .refine((c) => c.valor_com_iva >= c.valor_sem_iva, {
    message: "comIva",
    path: ["valor_com_iva"],
  });
export type DadosConta = z.input<typeof esquemaConta>;
export type ContaValidada = z.output<typeof esquemaConta>;

export const esquemaMeta = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/, "data"),
  valor_sem_iva: euros.refine((v) => v > 0, "valor"),
  base: z.enum(["mrr", "recebido"]),
});
export type DadosMeta = z.input<typeof esquemaMeta>;
