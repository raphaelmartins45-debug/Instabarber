import { z } from "zod";
import { COMO_MARCAM, type DadosBriefing, DORES } from "@/lib/comercial/briefing";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { type DadosNovoLead, ORIGENS, ORIGENS_PROSPECAO } from "./comercial";

// Proposta rápida do Gerador de documentos (D-181): num só formulário, o lead novo e os campos
// do briefing que a proposta pede (os * da N.4). O mesmo esquema valida o formulário e a ação.

const texto = (min: number, max: number) => z.string().trim().min(min, "obrigatorio").max(max);
const inteiro = (min: number, max: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, "numero")
    .transform(Number)
    .pipe(z.number().int().min(min, "numero").max(max, "numero"));
const opcionalInteiro = z
  .string()
  .trim()
  .default("")
  .refine((v) => !v || (/^\d+$/.test(v) && Number(v) <= 100_000), "numero");

export const esquemaPropostaRapida = z
  .object({
    nome_contacto: texto(1, 120),
    nome_barbearia: texto(1, 120),
    cidade: texto(0, 80).default(""),
    telefone: z
      .string()
      .trim()
      .max(30)
      .refine((v) => !!telefoneE164(v), "telefone"),
    email: z.union([z.literal(""), z.string().trim().email("email").max(160)]).default(""),
    origem: z.enum(ORIGENS),
    consentimento_contacto: z.boolean().default(false),
    n_barbeiros: inteiro(1, 200),
    como_marcam: z.array(z.enum(COMO_MARCAM)).min(1, "obrigatorio"),
    clientes_ativos: inteiro(0, 100_000),
    valor_visita: z
      .string()
      .trim()
      .refine((v) => (centimosDeTexto(v) ?? 0) > 0, "valor"),
    faltas_semana: opcionalInteiro,
    clientes_perdidos: opcionalInteiro,
    dores: z.array(z.enum(DORES)).min(1, "obrigatorio"),
    objetivo: texto(1, 400),
    plano: z.enum(["basic", "pro"]),
    profissionais: inteiro(1, 200),
    periodicidade: z.enum(["mensal", "anual"]),
    dominio_proprio: z.boolean().default(false),
    proxima_acao: texto(1, 200),
    proxima_acao_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data"),
  })
  .superRefine((p, ctx) => {
    if (ORIGENS_PROSPECAO.includes(p.origem) && !p.consentimento_contacto)
      ctx.addIssue({ code: "custom", message: "consentimento", path: ["consentimento_contacto"] });
    if (p.plano === "pro" && p.profissionais < 3)
      ctx.addIssue({ code: "custom", message: "pro_minimo", path: ["profissionais"] });
  });

export type DadosPropostaRapida = z.input<typeof esquemaPropostaRapida>;
export type PropostaRapida = z.output<typeof esquemaPropostaRapida>;

/** O lead novo e o briefing que a proposta rápida grava, a partir do formulário validado. */
export function dividirPropostaRapida(p: PropostaRapida): {
  lead: DadosNovoLead;
  briefing: DadosBriefing;
} {
  const opcional = (v: string) => (v ? Number(v) : undefined);
  return {
    lead: {
      nome_contacto: p.nome_contacto,
      nome_barbearia: p.nome_barbearia,
      cidade: p.cidade,
      telefone: p.telefone,
      email: p.email,
      n_barbeiros: String(p.n_barbeiros),
      origem: p.origem,
      consentimento_contacto: p.consentimento_contacto,
      fala_com_decisor: true,
      proxima_acao: p.proxima_acao,
      proxima_acao_em: p.proxima_acao_em,
    },
    briefing: {
      nome_comercial: p.nome_barbearia,
      cidade: p.cidade,
      n_barbeiros: p.n_barbeiros,
      como_marcam: p.como_marcam,
      clientes_ativos: p.clientes_ativos,
      valor_visita_cent: centimosDeTexto(p.valor_visita) ?? 0,
      faltas_semana: opcional(p.faltas_semana),
      clientes_perdidos: opcional(p.clientes_perdidos),
      dores: p.dores,
      objetivo: p.objetivo,
      plano: p.plano,
      profissionais: p.plano === "basic" ? 1 : p.profissionais,
      periodicidade: p.periodicidade,
      dominio_proprio: p.dominio_proprio,
      decisor_nome: p.nome_contacto,
      decisor_telemovel: p.telefone,
      decisor_email: p.email,
    },
  };
}
