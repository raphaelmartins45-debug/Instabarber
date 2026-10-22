import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TomEtiqueta = "sucesso" | "alerta" | "perda" | "info" | "destaque" | "neutro";

const TONS: Record<TomEtiqueta, string> = {
  sucesso: "border-sucesso/25 bg-sucesso/12 text-sucesso",
  alerta: "border-alerta/25 bg-alerta/12 text-alerta",
  perda: "border-destructive/25 bg-destructive/12 text-destructive",
  info: "border-info/25 bg-info/12 text-info",
  destaque: "border-destaque/25 bg-accent text-ligacao",
  neutro: "border-border bg-foreground/[.04] text-muted-foreground",
};

/** Etiqueta de estado (pastel, com ponto: o estado nunca depende só da cor). */
export function Etiqueta({ tom = "neutro", children }: { tom?: TomEtiqueta; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-medium",
        TONS[tom],
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
