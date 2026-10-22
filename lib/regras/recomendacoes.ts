import type { ProgressoObjetivo } from "./objetivos";

// O bloco «O que fazer no próximo mês» (F.5): as regras avaliam-se por esta ordem e mostram-se
// as primeiras quatro que se verificarem. Cada uma resulta de um número do relatório.

export const MAXIMO_RECOMENDACOES = 4;
export const LIMITE_PERDIDOS = 20;
export const OCUPACAO_FRACA = 50;
export const OBJETIVO_QUASE = 80;

export type DiaFraco = { diaSemana: number; ocupacao: number; adicionalCent: number };

export type Recomendacao =
  | { tipo: "campanha"; perdidos: number; valorCent: number }
  | ({ tipo: "preco_periodo" } & DiaFraco)
  | { tipo: "combinacao"; servicos: string[]; ticketCent: number; ticketAnteriorCent: number }
  | { tipo: "premios"; cartoes: number }
  | { tipo: "objetivo"; porDiaCent: number; diasRestantes: number; percentagem: number };

/**
 * Receita adicional estimada de um dia fraco: os minutos que faltam para chegar a 50 % de
 * ocupação, à receita média por minuto marcado do mês (D-126).
 */
export function receitaAdicionalEstimada(
  disponiveisMin: number,
  marcadosMin: number,
  receitaPorMinutoCent: number,
): number {
  const emFalta = Math.max(0, (disponiveisMin * OCUPACAO_FRACA) / 100 - marcadosMin);
  return Math.round(emFalta * receitaPorMinutoCent);
}

export function recomendacoes(e: {
  perdidos: number;
  aRecuperarCent: number;
  /** Dias da semana com ocupação calculada (os sem horário ficam de fora). */
  diasSemana: DiaFraco[];
  ticketCent: number;
  ticketAnteriorCent: number;
  combinacao: string[] | null;
  cartoesCompletos: number;
  objetivo: ProgressoObjetivo | null;
}): Recomendacao[] {
  const r: Recomendacao[] = [];
  if (e.perdidos > LIMITE_PERDIDOS)
    r.push({ tipo: "campanha", perdidos: e.perdidos, valorCent: e.aRecuperarCent });
  const fraco = [...e.diasSemana]
    .filter((d) => d.ocupacao < OCUPACAO_FRACA)
    .sort((a, b) => a.ocupacao - b.ocupacao)[0];
  if (fraco) r.push({ tipo: "preco_periodo", ...fraco });
  if (e.ticketAnteriorCent > 0 && e.ticketCent < e.ticketAnteriorCent && e.combinacao)
    r.push({
      tipo: "combinacao",
      servicos: e.combinacao,
      ticketCent: e.ticketCent,
      ticketAnteriorCent: e.ticketAnteriorCent,
    });
  if (e.cartoesCompletos > 0) r.push({ tipo: "premios", cartoes: e.cartoesCompletos });
  const o = e.objetivo;
  if (
    o &&
    o.objetivoCent > 0 &&
    o.percentagem > OBJETIVO_QUASE &&
    o.percentagem < 100 &&
    o.diasRestantes > 0
  )
    r.push({
      tipo: "objetivo",
      porDiaCent: o.necessarioPorDiaCent,
      diasRestantes: o.diasRestantes,
      percentagem: o.percentagem,
    });
  return r.slice(0, MAXIMO_RECOMENDACOES);
}
