"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * Um número com − e + ao lado do campo: no telemóvel, mais rápido do que o teclado. O campo
 * continua editável e o valor fica sempre entre o mínimo e o máximo.
 */
export function ContadorNumero({
  id,
  rotulo,
  ajuda,
  valor,
  aoMudar,
  minimo,
  maximo,
  passo = 1,
  rotuloMenos,
  rotuloMais,
  desativado,
}: {
  id: string;
  rotulo: string;
  ajuda?: string;
  valor: number;
  aoMudar: (valor: number) => void;
  minimo: number;
  maximo: number;
  passo?: number;
  rotuloMenos: string;
  rotuloMais: string;
  desativado?: boolean;
}) {
  const limitar = (v: number) =>
    Math.min(maximo, Math.max(minimo, Number.isFinite(v) ? v : minimo));
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="rotulo">
        {rotulo}
      </Label>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={rotuloMenos}
          disabled={desativado || valor <= minimo}
          onClick={() => aoMudar(limitar(valor - passo))}
        >
          <Minus />
        </Button>
        <input
          id={id}
          inputMode="numeric"
          value={valor}
          disabled={desativado}
          aria-describedby={ajuda ? `${id}-ajuda` : undefined}
          onChange={(e) => aoMudar(limitar(Number(e.target.value.replace(/\D/g, "")) || 0))}
          className="numero h-10 w-16 min-w-0 rounded-md border border-input bg-campo text-center text-base font-semibold tabular-nums disabled:opacity-60"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={rotuloMais}
          disabled={desativado || valor >= maximo}
          onClick={() => aoMudar(limitar(valor + passo))}
        >
          <Plus />
        </Button>
      </div>
      {ajuda ? (
        <p id={`${id}-ajuda`} className="text-xs text-muted-foreground">
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}
