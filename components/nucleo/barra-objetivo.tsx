/**
 * Barra de progresso com a marca do esperado (gráfico «bullet», D-203): o preenchido é o feito;
 * o traço é onde se devia estar hoje. Valores de 0 a 100; acima de 100 a barra fica cheia.
 */
export function BarraObjetivo({
  valor,
  marca,
  rotulo,
}: {
  valor: number;
  marca?: number;
  /** O que a barra diz, para leitores de ecrã. */
  rotulo: string;
}) {
  const limitar = (n: number) => Math.max(0, Math.min(100, n));
  return (
    <div role="img" aria-label={rotulo} className="relative mt-2 h-2 rounded-full bg-muted">
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-destaque"
        style={{ width: `${limitar(valor)}%` }}
      />
      {marca !== undefined ? (
        <span
          aria-hidden
          className="absolute -inset-y-1 w-0.5 rounded-full bg-foreground"
          style={{ left: `${limitar(marca)}%` }}
        />
      ) : null}
    </div>
  );
}
