import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

/** Indicador de posição nos quatro passos (D.8). */
export function IndicadorPassos({ atual }: { atual: number }) {
  const passos = textos.adesao.passos;
  return (
    <div className="grid gap-2">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {textos.adesao.passoDe(atual + 1, passos.length)}
      </p>
      <ol className="grid grid-cols-4 gap-1.5">
        {passos.map((p, i) => (
          <li key={p} aria-current={i === atual ? "step" : undefined}>
            <span
              className={cn("block h-1.5 rounded-full", i <= atual ? "bg-destaque" : "bg-border")}
            />
            <span
              className={cn(
                "mt-1 hidden text-xs sm:block",
                i === atual ? "font-semibold" : "text-muted-foreground",
              )}
            >
              {p}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
