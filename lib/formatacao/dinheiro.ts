import { regiao } from "./regiao";

// Dinheiro em cêntimos inteiros no TypeScript; numeric(10,2) na base de dados (CLAUDE.md §5).
// Este é o único sítio que converte entre os dois.

const NUMERIC = /^(-)?(\d+)(?:\.(\d{1,2}))?$/;

/** "12.30" (numeric(10,2)) → 1230 cêntimos. */
export function centimosDeNumeric(valor: string): number {
  const partes = NUMERIC.exec(valor.trim());
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
