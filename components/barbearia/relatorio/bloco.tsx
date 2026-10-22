import type { ReactNode } from "react";

/** Um bloco numerado do relatório (E.5). */
export function BlocoRelatorio({
  n,
  titulo,
  children,
}: {
  n: number;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`bloco-${n}`}
      className="grid gap-3 break-inside-avoid"
      data-testid={`bloco-${n}`}
    >
      <h2 id={`bloco-${n}`} className="text-[15px] font-bold">
        <span className="mr-2 text-muted-foreground tabular-nums">{n}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}
