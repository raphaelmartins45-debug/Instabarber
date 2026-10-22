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

/** Data curta no fuso da região: «22/10/2026». */
export function dataCurta(instante: Date | string): string {
  return formatInTimeZone(new Date(instante), regiao.fuso, "dd/MM/yyyy");
}

/** Data e hora no fuso da região: «22/10/2026 14:05». */
export function dataHora(instante: Date | string): string {
  return formatInTimeZone(new Date(instante), regiao.fuso, "dd/MM/yyyy HH:mm");
}

/** Data ISO (AAAA-MM-DD) de hoje no fuso da região, para campos de data. */
export function hojeIso(agora: Date = new Date()): string {
  return formatInTimeZone(agora, regiao.fuso, "yyyy-MM-dd");
}

/** Hora no fuso da região: «14:05». */
export function horaCurta(instante: Date | string): string {
  return formatInTimeZone(new Date(instante), regiao.fuso, "HH:mm");
}
