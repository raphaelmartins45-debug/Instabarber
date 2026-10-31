"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

const t = textos.vendas.guiao;

/**
 * Guião da visita (D-181): os sete passos como lista para ir marcando durante a visita, com o
 * progresso em cima. Só ajuda a pessoa: nada se grava.
 */
export function GuiaoVisita() {
  const [feitos, setFeitos] = useState<Set<number>>(new Set());
  const total = t.passos.length;
  const alternar = (i: number) =>
    setFeitos((atual) => {
      const novo = new Set(atual);
      if (novo.has(i)) novo.delete(i);
      else novo.add(i);
      return novo;
    });
  return (
    <div className="grid gap-4" data-testid="guiao-visita">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold tabular-nums" data-testid="guiao-progresso">
            {t.feito(feitos.size, total)}
          </span>
          {feitos.size ? (
            <Button type="button" size="xs" variant="ghost" onClick={() => setFeitos(new Set())}>
              {t.recomecar}
            </Button>
          ) : null}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[.08]" aria-hidden>
          <div
            className="h-full origin-left rounded-full bg-destaque transition-transform duration-300 ease-sistema motion-reduce:transition-none"
            style={{ transform: `scaleX(${feitos.size / total})` }}
          />
        </div>
      </div>
      <ol className="grid gap-2">
        {t.passos.map((p, i) => {
          const feito = feitos.has(i);
          return (
            <li key={p.titulo}>
              <button
                type="button"
                role="checkbox"
                aria-checked={feito}
                aria-label={t.marcar(p.titulo)}
                onClick={() => alternar(i)}
                className={cn(
                  "grid w-full grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,transform] duration-150 ease-sistema active:scale-[0.99]",
                  feito ? "border-[rgba(var(--ac-rgb),.45)] bg-[rgba(var(--ac-rgb),.05)]" : "",
                )}
              >
                <span
                  className={cn(
                    "numero flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors duration-150",
                    feito ? "bg-destaque text-primary-foreground" : "bg-foreground text-background",
                  )}
                >
                  {feito ? <Check className="size-4" aria-hidden /> : i + 1}
                </span>
                <span className="grid gap-0.5">
                  <span
                    className={cn("font-semibold", feito && "text-muted-foreground line-through")}
                  >
                    {p.titulo}
                  </span>
                  <span className="text-sm text-muted-foreground">{p.texto}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <Button asChild variant="outline" className="justify-self-start">
        <Link href="/admin/comercial/leads/novo">{t.novoLead}</Link>
      </Button>
    </div>
  );
}
