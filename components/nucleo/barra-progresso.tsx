/**
 * Barra fina de progresso (0 a 100 %; acima de 100 fica cheia). Cresce com transform (scaleX), para
 * correr a 60 fps; com movimento reduzido, aparece já cheia (D-134).
 */
export function BarraProgresso({ percentagem, rotulo }: { percentagem: number; rotulo: string }) {
  const largura = Math.max(0, Math.min(100, percentagem));
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={largura}
      className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[.08]"
    >
      <div
        className="h-full origin-left rounded-full bg-destaque shadow-[0_0_12px_rgba(var(--ac-rgb),.5)] transition-transform duration-700 ease-sistema"
        style={{ transform: `scaleX(${largura / 100})` }}
      />
    </div>
  );
}
