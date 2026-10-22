/** Barra de progresso para um objetivo (0 a 100 %; acima de 100 fica cheia). */
export function BarraProgresso({ percentagem, rotulo }: { percentagem: number; rotulo: string }) {
  const largura = Math.max(0, Math.min(100, percentagem));
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={largura}
      className="h-3 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-destaque" style={{ width: `${largura}%` }} />
    </div>
  );
}
