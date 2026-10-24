import { z } from "zod";
import { nifValido } from "@/lib/validacao/nif";

// Contrato a partir de um modelo aprovado (N.6, N.8): os marcadores {{…}} são substituídos
// pelos dados da proposta aceite, do contratante e da Prestadora. Um marcador desconhecido, ou
// um obrigatório sem valor, impede a geração e diz qual.

export const MARCADORES = [
  "contratante.razao_social",
  "contratante.nif",
  "contratante.morada",
  "contratante.representante",
  "contratante.cargo",
  "contratante.email",
  "proposta.numero",
  "plano",
  "profissionais",
  "periodicidade",
  "valor_sem_iva",
  "valor_com_iva",
  "iva_texto",
  "dominio_proprio",
  "data_inicio",
  "data_assinatura",
  "contrato.numero",
  "prestadora.nome",
  "prestadora.nif",
  "prestadora.morada",
  "prestadora.qualidade",
  "prestadora.assinante",
  "condicoes_lancamento",
  "desafio",
] as const;
export type Marcador = (typeof MARCADORES)[number];

/** Sem valor, passam a «Não aplicável» (N.8). */
export const OPCIONAIS: readonly Marcador[] = [
  "dominio_proprio",
  "condicoes_lancamento",
  "desafio",
];

/**
 * Preenchidos depois de gerar: o número dá-o a base de dados (gerar_contrato) e a data de
 * assinatura escreve-se à mão no papel ou fica na assinatura digital (D-148).
 */
export const DEPOIS: readonly Marcador[] = ["contrato.numero", "data_assinatura"];

const PADRAO = /\{\{\s*([a-z_.]+)\s*\}\}/g;

export type Substituicao =
  | { ok: true; texto: string }
  | { ok: false; desconhecidos: string[]; emFalta: string[] };

export function substituirMarcadores(
  corpo: string,
  valores: Partial<Record<Marcador, string>>,
  naoAplicavel: string,
): Substituicao {
  const usados = [...new Set([...corpo.matchAll(PADRAO)].map((m) => m[1]!))];
  const desconhecidos = usados.filter((m) => !(MARCADORES as readonly string[]).includes(m));
  const emFalta = usados.filter(
    (m) =>
      !desconhecidos.includes(m) &&
      !OPCIONAIS.includes(m as Marcador) &&
      !DEPOIS.includes(m as Marcador) &&
      !valores[m as Marcador]?.trim(),
  );
  if (desconhecidos.length || emFalta.length) return { ok: false, desconhecidos, emFalta };
  const texto = corpo.replace(PADRAO, (inteiro, nome: Marcador) => {
    if (DEPOIS.includes(nome)) return valores[nome]?.trim() || inteiro;
    return valores[nome]?.trim() || naoAplicavel;
  });
  return { ok: true, texto };
}

/** Depois de gerar: o número do contrato e o espaço para a data de assinatura. */
export const completarDepoisDeGerar = (texto: string, numero: string, espacoData: string) =>
  texto
    .replace(/\{\{\s*contrato\.numero\s*\}\}/g, numero)
    .replace(/\{\{\s*data_assinatura\s*\}\}/g, espacoData);

/** Dados do contratante (N.6): confirmados pelo operador antes de gerar. */
export const esquemaContratante = z.object({
  razao_social: z.string().trim().min(1, "razao_social").max(160),
  nif: z.string().trim().refine(nifValido, "nif"),
  morada: z.string().trim().min(1, "morada").max(240),
  representante: z.string().trim().min(1, "representante").max(120),
  cargo: z.string().trim().max(80).default(""),
  email: z.union([z.literal(""), z.string().trim().email("email")]).default(""),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data_inicio"),
});
export type DadosContratante = z.input<typeof esquemaContratante>;
