import { z } from "zod";

// Briefing em sete passos (N.4), guardado em briefings.dados e validado com o mesmo esquema no
// formulário e no servidor. Pode ficar a meio: só os campos marcados com * são precisos para
// gerar a proposta (`emFaltaParaProposta`).

const texto = (maximo: number) => z.string().trim().max(maximo).optional().default("");
const inteiro = z.coerce.number().int().min(0).max(100_000).optional();

export const COMO_MARCAM = ["telefone", "whatsapp", "caderno", "sistema", "outro"] as const;
export const DORES = [
  "faltas",
  "desaparecem",
  "financeiro",
  "comissoes",
  "fidelizacao",
  "presenca_online",
] as const;
export const MODELOS_CAIXA = ["A", "B", "C"] as const;

export const esquemaBriefing = z.object({
  // 1 · Barbearia
  nome_comercial: texto(120),
  firma: texto(160),
  nif: z
    .union([z.literal(""), z.string().regex(/^\d{9}$/, "nif")])
    .optional()
    .default(""),
  morada: texto(240),
  cidade: texto(80),
  ano_abertura: texto(4),
  cadeiras: inteiro,
  horario: texto(200),
  // 2 · Equipa
  n_barbeiros: inteiro,
  regimes: texto(300),
  modelo_caixa: z.enum(MODELOS_CAIXA).optional(),
  quem_decide: texto(120),
  // 3 · Situação atual
  como_marcam: z.array(z.enum(COMO_MARCAM)).optional().default([]),
  sistema_atual: texto(120),
  custo_sistema: texto(60),
  clientes_ativos: inteiro,
  valor_visita_cent: inteiro,
  faltas_semana: inteiro,
  clientes_perdidos: inteiro,
  // 4 · Dores e objetivos
  dores: z.array(z.enum(DORES)).optional().default([]),
  objetivo: texto(400),
  // 5 · Plano recomendado
  plano: z.enum(["basic", "pro"]).optional().default("pro"),
  profissionais: z.coerce.number().int().min(1).max(200).optional().default(3),
  periodicidade: z.enum(["mensal", "anual"]).optional().default("mensal"),
  dominio_proprio: z.boolean().optional().default(false),
  // 6 · Condições
  condicoes_lancamento: texto(1000),
  desafio_90: z.boolean().optional().default(false),
  validade_dias: z.coerce.number().int().min(1).max(90).optional().default(15),
  // Descontos (D-161): só valem com as condições comerciais ligadas; percentagens inteiras.
  desconto_mensalidade_pct: z.coerce.number().int().min(0).max(100).optional().default(0),
  desconto_taxa_pct: z.coerce.number().int().min(0).max(100).optional().default(0),
  data_arranque: texto(10),
  // 7 · Contacto e decisor
  decisor_nome: texto(120),
  decisor_cargo: texto(80),
  decisor_email: z
    .union([z.literal(""), z.string().trim().email("email")])
    .optional()
    .default(""),
  decisor_telemovel: texto(30),
});
export type Briefing = z.output<typeof esquemaBriefing>;
export type DadosBriefing = z.input<typeof esquemaBriefing>;

/** Campos com * na N.4 que ainda faltam para gerar a proposta. */
export function emFaltaParaProposta(b: Briefing): string[] {
  const falta: string[] = [];
  if (!b.nome_comercial) falta.push("nome_comercial");
  if (!b.n_barbeiros) falta.push("n_barbeiros");
  if (b.como_marcam.length === 0) falta.push("como_marcam");
  if (b.clientes_ativos === undefined) falta.push("clientes_ativos");
  if (!b.valor_visita_cent) falta.push("valor_visita_cent");
  if (b.dores.length === 0) falta.push("dores");
  if (!b.objetivo) falta.push("objetivo");
  if (!b.decisor_nome) falta.push("decisor_nome");
  if (!b.decisor_telemovel) falta.push("decisor_telemovel");
  return falta;
}

/**
 * «O que isto vale para si» (N.4): clientes que deixaram de vir × valor da visita × 0,4 (F.1).
 * Só existe se o operador preencheu os dois números. Sempre estimativa, nunca promessa.
 */
export function valorParaSiCent(b: Briefing): number | null {
  if (!b.clientes_perdidos || !b.valor_visita_cent) return null;
  return Math.round(b.clientes_perdidos * b.valor_visita_cent * 0.4);
}
