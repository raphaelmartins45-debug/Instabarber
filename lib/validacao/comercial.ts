import { z } from "zod";
import { telefoneE164 } from "@/lib/formatacao/telefone";

// Validação do Comercial (N.3). O mesmo esquema valida o formulário e a ação de servidor.

export const ORIGENS = ["landing", "whatsapp", "email", "indicacao", "visita", "outro"] as const;
export const ESTADOS_MANUAIS = [
  "novo",
  "contactado",
  "demonstracao",
  "proposta",
  "perdido",
] as const;
export const TIPOS_EVENTO = ["nota", "chamada", "mensagem"] as const;

const opcional = (maximo: number) => z.string().trim().max(maximo).optional().default("");
const data = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).default("");

export const esquemaLead = z
  .object({
    nome_contacto: z.string().trim().min(1, "nome").max(120),
    nome_barbearia: opcional(120),
    cidade: opcional(80),
    telefone: z
      .string()
      .trim()
      .max(30)
      .default("")
      .refine((v) => !v || !!telefoneE164(v), "telefone"),
    email: z.union([z.literal(""), z.string().trim().email("email").max(160)]).default(""),
    n_barbeiros: opcional(20),
    origem: z.enum(ORIGENS),
  })
  .refine((l) => l.telefone || l.email, { message: "contacto", path: ["telefone"] });
export type DadosLead = z.input<typeof esquemaLead>;

export const esquemaEstado = z
  .object({ estado: z.enum(ESTADOS_MANUAIS), motivo: opcional(400) })
  .refine((e) => e.estado !== "perdido" || e.motivo.length > 0, {
    message: "motivo",
    path: ["motivo"],
  });
export type DadosEstado = z.input<typeof esquemaEstado>;

export const esquemaEvento = z.object({
  tipo: z.enum(TIPOS_EVENTO),
  texto: z.string().trim().min(1, "texto").max(2000),
  proxima_acao: opcional(200),
  proxima_acao_em: data,
});
export type DadosEvento = z.input<typeof esquemaEvento>;
