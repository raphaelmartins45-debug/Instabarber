import type { Acerto } from "./acertos";

// Faturação e receita: duas palavras, duas contas (F.4.11, D-23). Uma só função calcula cada uma.

/** Faturação de serviços: Σ valor cobrado das visitas, todos os modelos. Mede a atividade. */
export function faturacaoServicos(visitas: readonly { valorCobradoCent: number }[]): number {
  return visitas.reduce((a, v) => a + v.valorCobradoCent, 0);
}

export type EntradasReceita = {
  /** Visitas do modelo A (a barbearia recebe do cliente). */
  visitasModeloA: readonly { valorCobradoCent: number }[];
  /** O acerto do mês de cada barbeiro (todos os modelos). */
  acertos: readonly Acerto[];
  mensalidadesClubeCent: number;
  lojaSemIvaCent: number;
};

/**
 * Receita da barbearia: receita própria do modelo A + parte da casa do modelo B + rendas do
 * modelo C + mensalidades do clube + loja sem IVA − comissões pagas.
 * Com os acertos: Σ cobrado do modelo A + Σ (a receber − a pagar) de cada barbeiro + clube + loja.
 */
export function receitaBarbearia(e: EntradasReceita): number {
  const acertos = e.acertos.reduce((a, x) => a + x.aReceberCent - x.aPagarCent, 0);
  return faturacaoServicos(e.visitasModeloA) + acertos + e.mensalidadesClubeCent + e.lojaSemIvaCent;
}

/** Comissões pagas pela barbearia no mês: Σ «a pagar» dos acertos. */
export function comissoesPagas(acertos: readonly Acerto[]): number {
  return acertos.reduce((a, x) => a + x.aPagarCent, 0);
}

export type ResumoMes = {
  faturacaoCent: number;
  receitaCent: number;
  custosCent: number;
  despesasCent: number;
  comissoesCent: number;
  resultadoCent: number;
  /** Resultado ÷ receita, em percentagem com uma casa; nulo sem receita. */
  margem: number | null;
};

/** Resumo do mês (E.2): resultado = receita da barbearia − custos fixos − despesas. */
export function resumoMes(e: {
  faturacaoCent: number;
  receitaCent: number;
  comissoesCent: number;
  custosCent: number;
  despesasCent: number;
}): ResumoMes {
  const resultadoCent = e.receitaCent - e.custosCent - e.despesasCent;
  return {
    ...e,
    resultadoCent,
    margem: e.receitaCent > 0 ? Math.round((resultadoCent / e.receitaCent) * 1000) / 10 : null,
  };
}
