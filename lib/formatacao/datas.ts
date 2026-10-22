import { differenceInMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { regiao } from "./regiao";

// Datas: timestamptz na base de dados; a hora local só se calcula aqui (CLAUDE.md §5).

/** Minutos inteiros que faltam até `fim` (0 se já passou). */
export function minutosAte(fim: string | Date, agora: Date = new Date()): number {
  return Math.max(0, differenceInMinutes(new Date(fim), agora, { roundingMethod: "ceil" }));
}

/** Dia da semana (0 = domingo) e hora «HH:mm:ss» no fuso da região. */
export function momentoLocal(instante: Date): { diaSemana: number; hora: string } {
  return {
    diaSemana: Number(formatInTimeZone(instante, regiao.fuso, "i")) % 7,
    hora: formatInTimeZone(instante, regiao.fuso, "HH:mm:ss"),
  };
}
