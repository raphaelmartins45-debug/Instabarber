import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.inicio.grafico;
const L = 600;
const A = 140;

/**
 * A faturação dos últimos 30 dias (D-203): uma barra por dia (hoje em destaque) e a média dos
 * dias abertos tracejada. SVG desenhado no servidor; os dias de descanso ficam vazios.
 */
export function GraficoFaturacao({
  dias,
  titulo = t.titulo,
}: {
  dias: { dia: string; cent: number }[];
  titulo?: string;
}) {
  const max = Math.max(1, ...dias.map((d) => d.cent));
  const total = dias.reduce((a, d) => a + d.cent, 0);
  const abertos = dias.filter((d) => d.cent > 0).length;
  const media = abertos ? total / abertos : 0;
  const passo = L / Math.max(1, dias.length);
  const y = (c: number) => A - (c / max) * (A - 8);
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold">{titulo}</h2>
        <span className="text-xs text-muted-foreground">
          {t.media(formatarDinheiro(Math.round(media)))}
        </span>
      </div>
      <svg
        role="img"
        aria-label={t.rotulo(formatarDinheiro(total))}
        viewBox={`0 0 ${L} ${A}`}
        preserveAspectRatio="none"
        className="h-36 w-full"
      >
        <line
          x1="0"
          x2={L}
          y1={y(media)}
          y2={y(media)}
          stroke="var(--borda-forte)"
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
        {dias.map((d, i) =>
          d.cent > 0 ? (
            <rect
              key={d.dia}
              x={i * passo + passo * 0.18}
              width={passo * 0.64}
              y={y(d.cent)}
              height={A - y(d.cent)}
              rx="3"
              fill={
                i === dias.length - 1
                  ? "var(--ac)"
                  : "color-mix(in srgb, var(--ac) 55%, transparent)"
              }
            >
              <title>{`${d.dia.slice(8, 10)}/${d.dia.slice(5, 7)} · ${formatarDinheiro(d.cent)}`}</title>
            </rect>
          ) : null,
        )}
      </svg>
    </div>
  );
}
