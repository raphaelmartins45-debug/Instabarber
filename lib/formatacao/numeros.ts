import { regiao } from "./regiao";

// Números (percentagens, quantidades) no formato da região. Nunca à mão nos componentes.

const formatador = new Intl.NumberFormat(regiao.idioma, { maximumFractionDigits: 2 });

/** 12.5 → «12,5». */
export function formatarNumero(n: number): string {
  return formatador.format(n);
}

const percentagem = new Intl.NumberFormat(regiao.idioma, {
  style: "percent",
  maximumFractionDigits: 1,
});

/** 0.472 → «47,2 %». */
export function formatarPercentagem(fracao: number): string {
  return percentagem.format(fracao);
}
