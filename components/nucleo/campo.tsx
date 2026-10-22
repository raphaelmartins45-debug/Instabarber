import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Rótulo, campo e mensagem de erro, ligados por id para os leitores de ecrã. */
export function Campo({
  id,
  rotulo,
  erro,
  ajuda,
  ...resto
}: ComponentProps<typeof Input> & { id: string; rotulo: string; erro?: string; ajuda?: string }) {
  const descricao = erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined;
  return (
    <div className="grid gap-1.5">
      {/* Etiqueta em maiúsculas pequenas por cima do campo (I.2). */}
      <Label htmlFor={id} className="rotulo">
        {rotulo}
      </Label>
      <Input
        id={id}
        aria-invalid={!!erro}
        aria-describedby={descricao}
        className="h-11"
        {...resto}
      />
      {erro ? (
        <p id={`${id}-erro`} className="text-sm text-destructive">
          {erro}
        </p>
      ) : ajuda ? (
        <p id={`${id}-ajuda`} className="text-xs text-muted-foreground">
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}
