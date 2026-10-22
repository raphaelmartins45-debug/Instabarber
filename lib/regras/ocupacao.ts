// Ocupação do dia (E.2): minutos marcados ÷ minutos de trabalho, sem as ausências.

export type Intervalo = { inicio: Date; fim: Date };

const MINUTO = 60_000;

function sobreposto(a: Intervalo, b: Intervalo): number {
  const ini = Math.max(a.inicio.getTime(), b.inicio.getTime());
  const fim = Math.min(a.fim.getTime(), b.fim.getTime());
  return Math.max(0, fim - ini);
}

/** Junta intervalos que se tocam, para não descontar duas vezes a mesma ausência. */
function unir(xs: readonly Intervalo[]): Intervalo[] {
  const ord = [...xs].sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  const out: Intervalo[] = [];
  for (const x of ord) {
    const ult = out[out.length - 1];
    if (ult && x.inicio <= ult.fim) {
      if (x.fim > ult.fim) ult.fim = x.fim;
    } else out.push({ inicio: x.inicio, fim: x.fim });
  }
  return out;
}

/** Minutos de trabalho nas janelas, sem o que as ausências cobrem. */
export function minutosDisponiveis(
  janelas: readonly Intervalo[],
  ausencias: readonly Intervalo[],
): number {
  const aus = unir(ausencias);
  const ms = janelas.reduce(
    (total, j) =>
      total +
      (j.fim.getTime() - j.inicio.getTime()) -
      aus.reduce((a, x) => a + sobreposto(j, x), 0),
    0,
  );
  return Math.round(ms / MINUTO);
}

/** Minutos marcados dentro das janelas. */
export function minutosMarcados(
  janelas: readonly Intervalo[],
  marcacoes: readonly Intervalo[],
): number {
  const ms = unir(marcacoes).reduce(
    (total, m) => total + janelas.reduce((a, j) => a + sobreposto(j, m), 0),
    0,
  );
  return Math.round(ms / MINUTO);
}

/** Percentagem inteira; nula quando não há tempo de trabalho. */
export function ocupacaoPercent(marcadosMin: number, disponiveisMin: number): number | null {
  if (disponiveisMin <= 0) return null;
  return Math.min(100, Math.round((marcadosMin / disponiveisMin) * 100));
}
