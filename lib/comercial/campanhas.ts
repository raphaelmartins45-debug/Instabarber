import type { Implementacao } from "./condicoes";

// Campanhas comerciais (D-190): condições especiais que a Performa LAB liga e o comercial escolhe
// na proposta. Aqui só a leitura e as regras puras; a base de dados confere tudo outra vez
// (campanha_disponivel, criar_proposta) e conta os meses de oferta no primeiro período.

export type Campanha = {
  id: string;
  chave: string;
  nome: string;
  texto: string;
  ativa: boolean;
  valida_ate: string | null;
  vagas: number | null;
  usadas: number;
  planos: string[];
  periodicidade: "mensal" | "semestral" | "anual" | null;
  implementacao: Implementacao | null;
  /** Preço da implementação na campanha, sem IVA, em cêntimos; nulo = preço normal. */
  implementacaoCent: number | null;
  meses_oferta: number;
  primeiro_mes_gratis: boolean;
  meses_condicao: number;
  desconto_temporario_pct: number;
  profissionais_gratis: number;
  dominio_gratis: boolean;
};

/** As campanhas que o comercial pode escolher para um plano, hoje (AAAA-MM-DD). */
export const campanhasDisponiveis = (lista: Campanha[], plano: string, hoje: string) =>
  lista.filter(
    (c) =>
      c.ativa &&
      (!c.valida_ate || c.valida_ate >= hoje) &&
      c.planos.includes(plano) &&
      (c.vagas === null || c.usadas < c.vagas),
  );

/** O que a campanha muda na barbearia, para saber quanto ela paga em cada período. */
export type CampanhaDaBarbearia = Pick<
  Campanha,
  | "primeiro_mes_gratis"
  | "meses_condicao"
  | "desconto_temporario_pct"
  | "profissionais_gratis"
  | "dominio_gratis"
>;

export type AjusteDoPeriodo = {
  /** O período não paga mensalidade (Primeiro mês por nossa conta). */
  semMensalidade: boolean;
  /** Desconto temporário na mensalidade, em percentagem. */
  descontoPct: number;
  /** Profissionais extra que não pagam. */
  profissionaisGratis: number;
  dominioGratis: boolean;
};

const SEM_AJUSTE: AjusteDoPeriodo = {
  semMensalidade: false,
  descontoPct: 0,
  profissionaisGratis: 0,
  dominioGratis: false,
};

/**
 * O ajuste da campanha ao período que a barbearia vai pagar. A condição temporária conta desde
 * o primeiro pagamento: antes dele (primeiro período) vale sempre; depois, até campanha_ate.
 */
export function ajusteDoPeriodo(
  c: CampanhaDaBarbearia | null,
  b: { primeiro_pagamento_em: string | null; campanha_ate: string | null },
  inicioDoPeriodo: string,
): AjusteDoPeriodo {
  if (!c) return SEM_AJUSTE;
  const primeiro = !b.primeiro_pagamento_em;
  const temporaria =
    c.meses_condicao > 0 && (primeiro || (!!b.campanha_ate && inicioDoPeriodo <= b.campanha_ate));
  return {
    semMensalidade: primeiro && c.primeiro_mes_gratis,
    descontoPct: temporaria ? c.desconto_temporario_pct : 0,
    profissionaisGratis: temporaria ? c.profissionais_gratis : 0,
    dominioGratis: temporaria && c.dominio_gratis,
  };
}
