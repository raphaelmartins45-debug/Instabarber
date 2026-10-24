import { calcularPrecoCent, TAXA_IVA, type RegimeIva } from "@/lib/regras/mensalidade";
import { type BarbeariaFaturavel, precoDaBarbearia, receitaMensal } from "@/lib/regras/receita";
import { type Custo, custoDaConta, custosDoMes } from "./custos";

// Indicadores das Finanças da Performa LAB (O.5, O.6), sempre sem IVA. A mensalidade vem da
// fórmula única (D.7); o anual conta 10/12 do mensal. Meses em «AAAA-MM», datas «AAAA-MM-DD».

export type BarbeariaFin = BarbeariaFaturavel & {
  estado_pagamento: string;
  /** Mês em que foi aprovada, ou nulo se ainda não foi. */
  aprovadaEm: string | null;
  /** Dia da última mudança de estado de uma barbearia cancelada (auditoria). */
  canceladaEm: string | null;
};
export type ContaFin = {
  semIvaCent: number;
  comIvaCent: number;
  pagoEm: string | null;
};
export type RecebimentoFin = { valorCent: number; data: string };

/** Recebido sem IVA: os recebimentos guardam o valor faturado (O.3). */
export const semIvaDoRecebido = (valorCent: number, regime: RegimeIva) =>
  regime === "isento" ? valorCent : Math.round(valorCent / (1 + TAXA_IVA));

/** Existia como cliente nesse mês: aprovada até ao fim do mês e não cancelada antes dele. */
export const ativaNoMes = (b: BarbeariaFin, mes: string) =>
  !!b.aprovadaEm &&
  b.aprovadaEm.slice(0, 7) <= mes &&
  (b.estado !== "cancelado" || (!!b.canceladaEm && b.canceladaEm.slice(0, 7) > mes));

/** MRR de um mês passado com o plano atual de cada barbearia (o histórico de planos não se guarda). */
export function mrrDoMes(barbearias: BarbeariaFin[], mes: string, regime: RegimeIva) {
  return receitaMensal(
    barbearias.filter((b) => ativaNoMes(b, mes)).map((b) => ({ ...b, estado: "ativo" })),
    regime,
  ).semIva;
}

export type Resumo = {
  mrr: number;
  ativas: number;
  recebido: number;
  custos: { fixos: number; variaveis: number; total: number };
  lucroEstimado: number;
  lucroCaixa: number;
  margem: number | null;
  arpu: number | null;
  atraso: { comIva: number; n: number };
  saidas: number | null;
};

export function resumoDoMes(d: {
  barbearias: BarbeariaFin[];
  recebimentos: RecebimentoFin[];
  custos: Custo[];
  contas: ContaFin[];
  mes: string;
  mesAnterior: string;
  regime: RegimeIva;
}): Resumo {
  const ativas = d.barbearias.filter((b) => b.estado === "ativo");
  const mrr = receitaMensal(d.barbearias, d.regime).semIva;
  const recebido = d.recebimentos
    .filter((r) => r.data.slice(0, 7) === d.mes)
    .reduce((s, r) => s + semIvaDoRecebido(r.valorCent, d.regime), 0);
  const custos = custosDoMes(d.custos, d.mes);
  const pagas = d.contas
    .filter((c) => c.pagoEm?.slice(0, 7) === d.mes)
    .reduce((s, c) => s + custoDaConta(c, d.regime), 0);
  const emAtraso = ativas.filter((b) => b.estado_pagamento === "em_atraso");
  const inicio = d.barbearias.filter((b) => ativaNoMes(b, d.mesAnterior)).length;
  const saidas = d.barbearias.filter(
    (b) => b.estado === "cancelado" && b.canceladaEm?.slice(0, 7) === d.mes,
  ).length;
  return {
    mrr,
    ativas: ativas.length,
    recebido,
    custos,
    lucroEstimado: mrr - custos.total,
    lucroCaixa: recebido - pagas,
    margem: mrr > 0 ? (mrr - custos.total) / mrr : null,
    arpu: ativas.length ? Math.round(mrr / ativas.length) : null,
    atraso: {
      comIva: emAtraso.reduce((s, b) => s + precoDaBarbearia(b, d.regime).comIva, 0),
      n: emAtraso.length,
    },
    // Só com mais de 10 barbearias: antes disso uma saída dá uma percentagem enganadora (O.5).
    saidas: inicio > 10 ? saidas / inicio : null,
  };
}

/** Receita, custos e lucro dos meses pedidos (o gráfico dos 12 meses). */
export function serieMensal(
  meses: string[],
  barbearias: BarbeariaFin[],
  custos: Custo[],
  regime: RegimeIva,
) {
  return meses.map((mes) => {
    const receita = mrrDoMes(barbearias, mes, regime);
    const c = custosDoMes(custos, mes).total;
    return { mes, receita, custos: c, lucro: receita - c };
  });
}

export function distribuicaoPorPlano(barbearias: BarbeariaFin[]) {
  const ativas = barbearias.filter((b) => b.estado === "ativo");
  return {
    basic: ativas.filter((b) => b.plano === "basic").length,
    pro: ativas.filter((b) => b.plano === "pro").length,
  };
}

/** Mensalidade sem IVA de referência de cada plano (mensal, profissionais incluídos). */
export const valorDoPlano = (plano: "basic" | "pro", regime: RegimeIva) =>
  calcularPrecoCent(plano, plano === "basic" ? 1 : 3, "mensal", false, regime).semIva;

/**
 * Ponto de equilíbrio (O.6): fixos ÷ (valor médio − custo variável por barbearia), arredondado
 * para cima. Nulo quando a margem por barbearia é zero ou negativa: não existe com estes custos.
 */
export function pontoDeEquilibrio(fixosCent: number, valorMedioCent: number, variavelCent: number) {
  const margem = valorMedioCent - variavelCent;
  if (margem <= 0) return null;
  return Math.ceil(fixosCent / margem);
}

/** Valor médio por barbearia: o real, ou a mistura escolhida (percentagem de Basic) sem clientes. */
export function valorMedio(arpu: number | null, percentBasic: number, regime: RegimeIva) {
  if (arpu !== null) return arpu;
  const p = Math.min(100, Math.max(0, percentBasic)) / 100;
  return Math.round(valorDoPlano("basic", regime) * p + valorDoPlano("pro", regime) * (1 - p));
}
