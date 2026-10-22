import { regiao } from "./regiao";

// Dinheiro em cêntimos inteiros no TypeScript; numeric(10,2) na base de dados (CLAUDE.md §5).
// Este é o único sítio que converte entre os dois.

const NUMERIC = /^(-)?(\d+)(?:\.(\d{1,2}))?$/;

/** "12.30" (numeric(10,2)) → 1230 cêntimos. O PostgREST devolve numeric como número JSON (12.3): também se aceita. */
export function centimosDeNumeric(valor: string | number): number {
  const partes = NUMERIC.exec(String(valor).trim());
  if (!partes) throw new Error(`Valor monetário inválido: ${valor}`);
  const [, sinal, euros = "0", decimais = ""] = partes;
  const centimos = Number(euros) * 100 + Number(decimais.padEnd(2, "0"));
  return sinal ? -centimos : centimos;
}

/** 1230 cêntimos → "12.30" (numeric(10,2)). */
export function numericDeCentimos(centimos: number): string {
  if (!Number.isInteger(centimos)) throw new Error(`Os cêntimos têm de ser inteiros: ${centimos}`);
  const sinal = centimos < 0 ? "-" : "";
  const absoluto = Math.abs(centimos);
  return `${sinal}${Math.floor(absoluto / 100)}.${String(absoluto % 100).padStart(2, "0")}`;
}

const formatador = new Intl.NumberFormat(regiao.idioma, {
  style: "currency",
  currency: regiao.moeda,
});

/** 1230 cêntimos → "12,30 €". */
export function formatarDinheiro(centimos: number): string {
  if (!Number.isInteger(centimos)) throw new Error(`Os cêntimos têm de ser inteiros: ${centimos}`);
  return formatador.format(centimos / 100);
}

const EUROS = /^(\d{1,6})(?:[.,](\d{1,2}))?$/;

/** O que a pessoa escreve num campo de preço («15», «15,5», «15.50») → cêntimos; null se inválido. */
export function centimosDeTexto(texto: string): number | null {
  const partes = EUROS.exec(texto.trim().replace(/\s*€$/, ""));
  if (!partes) return null;
  const [, euros = "0", decimais = ""] = partes;
  return Number(euros) * 100 + Number(decimais.padEnd(2, "0"));
}

/**
 * Cêntimos → número para uma coluna numeric(10,2) via PostgREST (os tipos gerados pedem number).
 * A divisão de um inteiro por 100 serializa sempre com no máximo duas casas («19.99»).
 */
export function numericParaGravar(centimos: number): number {
  return Number(numericDeCentimos(centimos));
}

/** Cêntimos → texto para um campo de preço editável («15,00»), o inverso de centimosDeTexto. */
export function textoDeCentimos(centimos: number): string {
  return numericDeCentimos(centimos).replace(".", regiao.separadorDecimal);
}
