import { regiao } from "./regiao";

// Números (percentagens, quantidades) no formato da região. Nunca à mão nos componentes.

const formatador = new Intl.NumberFormat(regiao.idioma, { maximumFractionDigits: 2 });

/** 12.5 → «12,5». */
export function formatarNumero(n: number): string {
  return formatador.format(n);
}
