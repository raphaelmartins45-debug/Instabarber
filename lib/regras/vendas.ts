import {
  calcularPrecoCent,
  INCLUIDOS,
  type Periodicidade,
  type Plano,
  type RegimeIva,
} from "./mensalidade";

// Ferramentas de apoio às vendas (D-181): o simulador de preço e a conta «quanto está a
// perder». Os preços vêm só da fórmula única (mensalidade.ts); aqui não há preços.

export type Simulacao = {
  plano: Plano;
  profissionais: number;
  dominioProprio: boolean;
  mensalCent: number;
  anualCent: number;
  /** O que se poupa por ano ao pagar o anual (dois meses). */
  poupancaAnualCent: number;
};

/** Profissionais aceites pelo plano: o Basic tem 1; o Pro, pelo menos os incluídos. */
export function profissionaisDoPlano(plano: Plano, pedido: number): number {
  if (plano === "basic") return 1;
  return Math.max(INCLUIDOS.pro, Math.floor(pedido) || INCLUIDOS.pro);
}

export function simularPreco(
  plano: Plano,
  pedidoProfissionais: number,
  dominioProprio: boolean,
  regime: RegimeIva,
): Simulacao {
  const profissionais = profissionaisDoPlano(plano, pedidoProfissionais);
  const preco = (p: Periodicidade) =>
    calcularPrecoCent(plano, profissionais, p, dominioProprio, regime).comIva;
  const mensalCent = preco("mensal");
  const anualCent = preco("anual");
  return {
    plano,
    profissionais,
    dominioProprio,
    mensalCent,
    anualCent,
    poupancaAnualCent: mensalCent * 12 - anualCent,
  };
}

/**
 * O que os clientes que deixaram de vir podem valer: perdidos × visita × 0,4 (F.1, N.4). A
 * única fórmula: o briefing (`valorParaSiCent`) e a calculadora da visita usam esta.
 */
export function valorRecuperavelCent(perdidos: number, visitaCent: number): number {
  return Math.round(Math.max(0, perdidos) * Math.max(0, visitaCent) * 0.4);
}

/** Semanas por mês, para passar faltas por semana a faltas por mês sem arredondar a 4. */
const SEMANAS_POR_MES = 52 / 12;

export type ContaPerdas = {
  /** O que as faltas custam por mês: faltas × valor da visita. */
  faltasMesCent: number;
  /** O que os clientes que deixaram de vir podem valer (`valorRecuperavelCent`). */
  recuperavelCent: number;
  /** Quantos cortes pagam a mensalidade. */
  cortesParaPagar: number;
};

/**
 * «Quanto está a perder»: estimativa para a conversa da visita, nunca promessa. A parte dos
 * clientes perdidos é a mesma do briefing.
 */
export function contaPerdas(d: {
  faltasSemana: number;
  valorVisitaCent: number;
  clientesPerdidos: number;
  mensalidadeCent: number;
}): ContaPerdas {
  const faltas = Math.max(0, d.faltasSemana);
  const visita = Math.max(0, d.valorVisitaCent);
  return {
    faltasMesCent: Math.round(faltas * SEMANAS_POR_MES * visita),
    recuperavelCent: valorRecuperavelCent(d.clientesPerdidos, visita),
    cortesParaPagar: visita > 0 ? Math.ceil(d.mensalidadeCent / visita) : 0,
  };
}
