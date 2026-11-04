/** Anel de progresso até ao objetivo (D-203), com a percentagem ao centro. 0 a 100 (ou mais). */
export function AnelObjetivo({ percentagem, rotulo }: { percentagem: number; rotulo: string }) {
  const r = 50;
  const volta = 2 * Math.PI * r;
  const feito = Math.max(0, Math.min(100, percentagem));
  return (
    <svg role="img" aria-label={rotulo} viewBox="0 0 120 120" className="size-24 shrink-0">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--sup-camada)" strokeWidth="12" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="var(--ac)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={volta}
        strokeDashoffset={volta * (1 - feito / 100)}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="67" textAnchor="middle" fill="var(--texto)" fontSize="22" fontWeight="700">
        {`${Math.round(percentagem)} %`}
      </text>
    </svg>
  );
}
