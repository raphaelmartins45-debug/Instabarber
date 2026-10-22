import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  getDaysInMonth,
} from "date-fns";
import { pt } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
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

// --- Calendário (datas ISO AAAA-MM-DD, sem hora) -------------------------------------------

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const meioDia = (dataIso: string) => new Date(`${dataIso}T12:00:00Z`);

/** Dias de calendário entre duas datas ISO (b − a). */
export function diasEntreDatas(a: string, b: string): number {
  if (!DIA.test(a) || !DIA.test(b)) throw new Error(`Data inválida: ${a} / ${b}`);
  return differenceInCalendarDays(meioDia(b), meioDia(a));
}

/** Dias de calendário, no fuso da região, desde um instante até agora. */
export function diasDesde(instante: Date | string, agora: Date = new Date()): number {
  return diasEntreDatas(hojeIso(new Date(instante)), hojeIso(agora));
}

/** Dia da semana (0 = domingo) de uma data ISO. */
export function diaSemanaDe(dataIso: string): number {
  return meioDia(dataIso).getUTCDay();
}

/** Todas as datas ISO do mês «AAAA-MM». */
export function diasDoMes(anoMes: string): string[] {
  const inicio = meioDia(`${anoMes}-01`);
  const total = getDaysInMonth(inicio);
  return Array.from({ length: total }, (_, i) => format(addDays(inicio, i), "yyyy-MM-dd"));
}

/** Data ISO somada de n dias. */
export function somarDias(dataIso: string, n: number): string {
  return format(addDays(meioDia(dataIso), n), "yyyy-MM-dd");
}

/** «AAAA-MM» do mês de hoje no fuso da região. */
export function mesAtual(agora: Date = new Date()): string {
  return hojeIso(agora).slice(0, 7);
}

/** Primeiro dia do mês (para colunas `date` com dia 1). */
export function primeiroDoMes(anoMes: string): string {
  return `${anoMes}-01`;
}

/** «AAAA-MM» do mês anterior (ou de n meses antes). */
export function mesAnterior(anoMes: string, n = 1): string {
  return format(addMonths(meioDia(`${anoMes}-01`), -n), "yyyy-MM");
}

/** O instante de uma data e hora locais da região («2026-10-22», «09:30»). */
export function instanteLocal(dataIso: string, hora: string): Date {
  return fromZonedTime(`${dataIso}T${hora.length === 5 ? `${hora}:00` : hora}`, regiao.fuso);
}

/** Nome do mês e ano por extenso: «outubro de 2026». */
export function mesPorExtenso(anoMes: string): string {
  return format(meioDia(`${anoMes}-01`), "MMMM 'de' yyyy", { locale: pt });
}

/** Data por extenso curta: «quinta-feira, 22 de outubro». */
export function diaPorExtenso(dataIso: string): string {
  return format(meioDia(dataIso), "EEEE, d 'de' MMMM", { locale: pt });
}

/** A mesma data no mês seguinte; dias 29 a 31 passam ao último dia do mês (F.4.2). */
export function mesmoDiaMesSeguinte(dataIso: string): string {
  return format(addMonths(meioDia(dataIso), 1), "yyyy-MM-dd");
}

/** Nome do mês: «outubro». */
export function nomeDoMes(anoMes: string): string {
  return format(meioDia(`${anoMes}-01`), "MMMM", { locale: pt });
}

const LOCALES: Record<string, string> = { pt: "pt-PT", en: "en-GB", fr: "fr-FR" };

/** Dia curto na língua do cliente: «qui., 22/10», «Thu 22/10» (página pública, I.3.2). */
export function diaCurtoNaLingua(dataIso: string, lingua: string): string {
  return new Intl.DateTimeFormat(LOCALES[lingua] ?? regiao.idioma, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(meioDia(dataIso));
}

/** Data longa de um instante na língua do cliente, no fuso da região: «quinta-feira, 22 de outubro». */
export function dataLongaNaLingua(instante: string, lingua: string): string {
  return new Intl.DateTimeFormat(LOCALES[lingua] ?? regiao.idioma, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: regiao.fuso,
  }).format(new Date(instante));
}

/** Os últimos n meses (AAAA-MM), do atual para trás. */
export function ultimosMeses(n: number, agora: Date = new Date()): string[] {
  const atual = mesAtual(agora);
  return Array.from({ length: n }, (_, i) => mesAnterior(atual, i));
}
