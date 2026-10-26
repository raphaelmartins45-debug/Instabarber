import { z } from "zod";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { COMO_MARCAM } from "@/lib/comercial/briefing";

// Validação do Comercial (N.3). O mesmo esquema valida o formulário e a ação de servidor.

export const ORIGENS = [
  "landing",
  "whatsapp",
  "email",
  "indicacao",
  "visita",
  "instagram",
  "outro",
] as const;
/** Origens em que é o comercial quem procura o contacto: pedem o consentimento (D-174). */
export const ORIGENS_PROSPECAO: readonly string[] = ["visita", "instagram", "indicacao"];
export const TEMPERATURAS = ["frio", "morno", "quente"] as const;
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

const inteiroTexto = (maximo: number) =>
  z
    .string()
    .trim()
    .default("")
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) <= maximo), "numero");

const camposLead = {
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
  // Ficha de prospeção (D-174): tudo opcional, menos o consentimento nas origens de prospeção.
  instagram: opcional(60),
  morada: opcional(240),
  google_nota: z
    .string()
    .trim()
    .default("")
    .refine((v) => !v || (/^\d([.,]\d)?$/.test(v) && Number(v.replace(",", ".")) <= 5), "nota"),
  google_avaliacoes: inteiroTexto(100_000),
  contacto_cargo: opcional(80),
  fala_com_decisor: z.boolean().default(false),
  origem_detalhe: opcional(200),
  consentimento_contacto: z.boolean().default(false),
  cadeiras: inteiroTexto(50),
  como_marcam: z.union([z.literal(""), z.enum(COMO_MARCAM)]).default(""),
  sistema_atual: opcional(120),
  custo_atual: z
    .string()
    .trim()
    .default("")
    .refine((v) => !v || centimosDeTexto(v) !== null, "valor"),
  fim_contrato_atual: data,
  temperatura: z.union([z.literal(""), z.enum(TEMPERATURAS)]).default(""),
};

type LeadBase = {
  telefone: string;
  email: string;
  origem: string;
  consentimento_contacto: boolean;
};
const regrasLead = (l: LeadBase, ctx: z.RefinementCtx) => {
  if (!l.telefone && !l.email)
    ctx.addIssue({ code: "custom", message: "contacto", path: ["telefone"] });
  if (ORIGENS_PROSPECAO.includes(l.origem) && !l.consentimento_contacto)
    ctx.addIssue({ code: "custom", message: "consentimento", path: ["consentimento_contacto"] });
};

export const esquemaLead = z.object(camposLead).superRefine(regrasLead);

/** Lead novo criado à mão: leva logo a próxima ação com data, para não ficar esquecido. */
export const esquemaNovoLead = z
  .object({
    ...camposLead,
    proxima_acao: z.string().trim().min(1, "proxima_acao").max(200),
    proxima_acao_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "proxima_acao_em"),
  })
  .superRefine(regrasLead);
export type DadosNovoLead = z.input<typeof esquemaNovoLead>;
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
