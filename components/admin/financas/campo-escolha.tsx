import type { ComponentProps } from "react";

/** Lista de escolha nativa para formulários com register (etiqueta em maiúsculas pequenas, I.2). */
export function CampoEscolha({
  id,
  rotulo,
  opcoes,
  ...resto
}: ComponentProps<"select"> & { id: string; rotulo: string; opcoes: Record<string, string> }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      <select
        id={id}
        className="h-11 rounded-md border border-input bg-card px-3 text-sm text-foreground"
        {...resto}
      >
        {Object.entries(opcoes).map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
