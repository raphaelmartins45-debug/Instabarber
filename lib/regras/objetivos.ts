import { diaSemanaDe, diasDoMes, instanteLocal } from "@/lib/formatacao/datas";

// Objetivos (F.3). Objetivo diário = mensal ÷ dias de funcionamento do mês, sem os dias de
// descanso, os feriados nacionais (se a barbearia fecha neles), os feriados próprios e os
// dias em que a barbearia inteira está ausente.

export type CalendarioBarbearia = {
  diasDescanso: readonly number[];
  fechaFeriados: boolean;
  horaAbertura: string;
  horaFecho: string;
  feriadosNacionais: readonly string[];
  feriadosProprios: readonly string[];
  /** Ausências com `profissional_id` nulo (a barbearia inteira). */
  ausenciasBarbearia: readonly { inicio: string; fim: string }[];
};

/** O dia fica fechado se uma ausência da barbearia cobre da abertura ao fecho. */
function ausenteTodoODia(dia: string, c: CalendarioBarbearia): boolean {
  const abre = instanteLocal(dia, c.horaAbertura).getTime();
  const fecha = instanteLocal(dia, c.horaFecho).getTime();
  return c.ausenciasBarbearia.some(
    (a) => new Date(a.inicio).getTime() <= abre && new Date(a.fim).getTime() >= fecha,
  );
}

export function diaDeFuncionamento(dia: string, c: CalendarioBarbearia): boolean {
  if (c.diasDescanso.includes(diaSemanaDe(dia))) return false;
  if (c.fechaFeriados && c.feriadosNacionais.includes(dia)) return false;
  if (c.feriadosProprios.includes(dia)) return false;
  return !ausenteTodoODia(dia, c);
}

/** Dias de funcionamento do mês «AAAA-MM». */
export function diasDeFuncionamento(anoMes: string, c: CalendarioBarbearia): string[] {
  return diasDoMes(anoMes).filter((d) => diaDeFuncionamento(d, c));
}

export type ProgressoObjetivo = {
  objetivoCent: number;
  faturadoCent: number;
  emFaltaCent: number;
  /** 0 a 100 (pode passar de 100 quando se ultrapassa o objetivo). */
  percentagem: number;
  diasFuncionamento: number;
  diasRestantes: number;
  objetivoDiarioCent: number;
  necessarioPorDiaCent: number;
};

/**
 * Progresso para o objetivo mensal. Os dias restantes contam a partir de hoje, inclusive
 * (hoje ainda se fatura).
 */
export function progressoObjetivo(
  objetivoCent: number,
  faturadoCent: number,
  diasFuncionamentoMes: readonly string[],
  hoje: string,
): ProgressoObjetivo {
  const emFaltaCent = Math.max(0, objetivoCent - faturadoCent);
  const diasRestantes = diasFuncionamentoMes.filter((d) => d >= hoje).length;
  const n = diasFuncionamentoMes.length;
  return {
    objetivoCent,
    faturadoCent,
    emFaltaCent,
    percentagem: objetivoCent > 0 ? Math.round((faturadoCent / objetivoCent) * 100) : 0,
    diasFuncionamento: n,
    diasRestantes,
    objetivoDiarioCent: n > 0 ? Math.round(objetivoCent / n) : 0,
    necessarioPorDiaCent: diasRestantes > 0 ? Math.round(emFaltaCent / diasRestantes) : emFaltaCent,
  };
}

/** Falta para o objetivo do dia: objetivo diário − faturado hoje, nunca abaixo de zero. */
export function faltaHoje(objetivoDiarioCent: number, faturadoHojeCent: number): number {
  return Math.max(0, objetivoDiarioCent - faturadoHojeCent);
}
