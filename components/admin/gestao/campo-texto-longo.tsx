import type { ComponentProps } from "react";
import { Label } from "@/components/ui/label";

/** Área de texto com etiqueta e erro, ligada por id (formulários do apoio e dos comunicados). */
export function CampoTextoLongo({
  id,
  rotulo,
  erro,
  ...resto
}: ComponentProps<"textarea"> & { id: string; rotulo: string; erro?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="rotulo">
        {rotulo}
      </Label>
      <textarea
        id={id}
        rows={4}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className="rounded-md border bg-transparent p-3 text-sm"
        {...resto}
      />
      {erro ? (
        <p id={`${id}-erro`} className="text-sm text-destructive">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
