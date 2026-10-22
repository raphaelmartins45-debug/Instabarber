import { cn } from "@/lib/utils";

const RAIO = 42;
const PERIMETRO = 2 * Math.PI * RAIO;

/**
 * Anel de progresso para objetivos (D-134): traço SVG com pontas redondas, valor tabular no
 * centro e brilho suave. O tom diz o estado, mas o texto também (nunca só a cor).
 */
export function AnelProgresso({
  percentagem,
  centro,
  legenda,
  rotulo,
  tom = "destaque",
  tamanho = 128,
}: {
  percentagem: number;
  /** O texto do centro, já formatado («78 %»). */
  centro: string;
  /** Linha pequena por baixo do centro («faltam 54 €»). */
  legenda?: string;
  /** Nome acessível do anel. */
  rotulo: string;
  tom?: "destaque" | "sucesso" | "alerta";
  tamanho?: number;
}) {
  const cheio = Math.max(0, Math.min(100, percentagem));
  const cor = { destaque: "text-destaque", sucesso: "text-sucesso", alerta: "text-alerta" }[tom];
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(cheio)}
      className="relative grid shrink-0 place-items-center"
      style={{ width: tamanho, height: tamanho }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={RAIO}
          fill="none"
          strokeWidth="8"
          className="stroke-foreground/[.08]"
        />
        <circle
          cx="50"
          cy="50"
          r={RAIO}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={PERIMETRO}
          strokeDashoffset={PERIMETRO * (1 - cheio / 100)}
          className={cn(
            cor,
            "drop-shadow-[0_0_6px_currentColor] transition-[stroke-dashoffset] duration-[900ms] ease-sistema",
          )}
        />
      </svg>
      <div className="relative grid justify-items-center text-center">
        <span className="numero text-2xl font-bold tracking-tight">{centro}</span>
        {legenda ? <span className="text-[11px] text-muted-foreground">{legenda}</span> : null}
      </div>
    </div>
  );
}
