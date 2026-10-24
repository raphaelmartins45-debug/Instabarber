// Objetivo e previsões das Finanças da Performa LAB (O.7, O.8). Funções puras: recebem os
// pressupostos e devolvem a projeção; o ecrã recalcula na hora, sem gravar nada. Cêntimos sem IVA.

export type Pressupostos = {
  /** Novas barbearias por mês. */
  novas: number;
  /** Saídas mensais, em fração (0,03 = 3 %). */
  saidas: number;
  /** Valor médio por barbearia (mistura de planos). */
  valorMedio: number;
};

export type Cenario = "pessimista" | "base" | "otimista";
export const CENARIOS: Cenario[] = ["pessimista", "base", "otimista"];

/** Pessimista: metade das novas, saídas × 1,5; otimista: novas × 1,5, saídas × 0,5 (O.8). */
export function pressupostosDoCenario(p: Pressupostos, c: Cenario): Pressupostos {
  if (c === "pessimista") return { ...p, novas: p.novas * 0.5, saidas: p.saidas * 1.5 };
  if (c === "otimista") return { ...p, novas: p.novas * 1.5, saidas: p.saidas * 0.5 };
  return p;
}

export type MesProjetado = { mes: string; mrr: number; custos: number; lucro: number };

/**
 * MRR(m+1) = MRR(m) + novas × valor médio − MRR(m) × saídas. `meses` são os 12 meses a seguir
 * ao atual; `custos[i]` o custo de cada um (os ativos, incluindo os que começam no futuro).
 */
export function projetar(
  mrrInicial: number,
  p: Pressupostos,
  meses: string[],
  custos: number[],
): MesProjetado[] {
  let mrr = mrrInicial;
  return meses.map((mes, i) => {
    mrr = mrr + p.novas * p.valorMedio - mrr * p.saidas;
    const arredondado = Math.round(mrr);
    const c = custos[i] ?? 0;
    return { mes, mrr: arredondado, custos: c, lucro: arredondado - c };
  });
}

/** O primeiro mês em que o lucro deixa de ser negativo (ponto de equilíbrio), ou nulo. */
export const mesDoEquilibrio = (p: MesProjetado[]) => p.find((m) => m.lucro >= 0)?.mes ?? null;

/** O primeiro mês em que o MRR chega à meta, ou nulo. */
export const mesDaMeta = (p: MesProjetado[], metaCent: number) =>
  p.find((m) => m.mrr >= metaCent)?.mes ?? null;

/** Quantas barbearias faltam (O.7): ⌈falta ÷ valor do plano⌉; zero quando a meta está cumprida. */
export function quantasFaltam(faltaCent: number, valorCent: number): number | null {
  if (faltaCent <= 0) return 0;
  if (valorCent <= 0) return null;
  return Math.ceil(faltaCent / valorCent);
}

/** Novas barbearias por mês por omissão: a média dos três meses anteriores ao atual. */
export function mediaNovas(aprovacoes: string[], mesesAnteriores: string[]): number {
  const n = aprovacoes.filter((d) => mesesAnteriores.includes(d.slice(0, 7))).length;
  return mesesAnteriores.length ? n / mesesAnteriores.length : 0;
}

/** Saídas por omissão: a observada com 10 ou mais barbearias; antes disso, 3 % declarados. */
export const SAIDAS_DECLARADAS = 0.03;
export function saidasPorOmissao(observada: number | null): { valor: number; declarada: boolean } {
  return observada === null
    ? { valor: SAIDAS_DECLARADAS, declarada: true }
    : { valor: observada, declarada: false };
}

/** Taxa de conversão das propostas (aceites ÷ decididas), só com 10 ou mais decididas (O.7). */
export function taxaConversao(aceites: number, recusadas: number): number | null {
  const decididas = aceites + recusadas;
  return decididas >= 10 ? aceites / decididas : null;
}

/** «E se tiver N barbearias Pro?»: MRR, lucro e margem com os custos do mês. */
export function eSeTiver(n: number, valorProCent: number, custosCent: number) {
  const mrr = Math.max(0, Math.round(n)) * valorProCent;
  const lucro = mrr - custosCent;
  return { mrr, lucro, margem: mrr > 0 ? lucro / mrr : null };
}

/** A meta do mês, ou a última definida antes dele (O.7). `metas` com `mes` = «AAAA-MM-01». */
export function metaEmVigor<T extends { mes: string }>(metas: T[], mes: string): T | null {
  return (
    [...metas]
      .filter((m) => m.mes.slice(0, 7) <= mes)
      .sort((a, b) => b.mes.localeCompare(a.mes))[0] ?? null
  );
}
