import { z } from "zod";

// Registo de apoio e comunicados (D-160). O mesmo esquema valida o formulário e a ação.

export const TIPOS_APOIO = ["chamada", "whatsapp", "email", "visita", "nota"] as const;

export const esquemaApoio = z.object({
  tipo: z.enum(TIPOS_APOIO),
  assunto: z.string().trim().min(1, "assunto").max(200, "assunto"),
  texto: z.string().trim().max(5000, "texto").default(""),
});
export type DadosApoio = z.input<typeof esquemaApoio>;

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "generico");

export const esquemaComunicado = z
  .object({
    titulo: z.string().trim().min(1, "titulo").max(120, "titulo"),
    texto: z.string().trim().min(1, "texto").max(3000, "texto"),
    destino: z.enum(["todas", "plano", "barbearia"]),
    plano: z.union([z.literal(""), z.enum(["basic", "pro"])]).default(""),
    inquilino_id: z.union([z.literal(""), z.string().uuid()]).default(""),
    inicio: data,
    fim: z.union([z.literal(""), data]).default(""),
  })
  .refine((c) => c.destino !== "plano" || c.plano !== "", { message: "plano", path: ["plano"] })
  .refine((c) => c.destino !== "barbearia" || c.inquilino_id !== "", {
    message: "barbearia",
    path: ["inquilino_id"],
  })
  .refine((c) => !c.fim || c.fim >= c.inicio, { message: "fim", path: ["fim"] });
export type DadosComunicado = z.input<typeof esquemaComunicado>;
