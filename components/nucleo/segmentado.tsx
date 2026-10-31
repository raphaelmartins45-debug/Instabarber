"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Escolha entre poucas opções lado a lado (grupo de rádio). A opção ativa ganha o fundo do
 * cartão; a troca é instantânea, porque se usa muitas vezes seguidas.
 */
export function Segmentado<T extends string>({
  rotulo,
  valor,
  aoMudar,
  opcoes,
}: {
  rotulo: string;
  valor: T;
  aoMudar: (valor: T) => void;
  opcoes: { id: T; rotulo: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label asChild className="rotulo">
        <span id={`seg-${rotulo}`}>{rotulo}</span>
      </Label>
      <div
        role="radiogroup"
        aria-labelledby={`seg-${rotulo}`}
        className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-border bg-foreground/[.04] p-1"
      >
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={o.id === valor}
            onClick={() => aoMudar(o.id)}
            className={cn(
              "h-9 min-w-0 truncate rounded-md px-3 text-sm font-semibold transition-[background-color,color,transform] duration-150 ease-sistema active:scale-[0.97]",
              o.id === valor
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}
