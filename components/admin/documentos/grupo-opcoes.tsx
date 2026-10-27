import type { UseFormRegisterReturn } from "react-hook-form";

/** Um grupo de caixas de escolha com legenda (várias opções), ligado ao formulário. */
export function GrupoOpcoes({
  legenda,
  opcoes,
  registo,
  erro,
}: {
  legenda: string;
  opcoes: { id: string; rotulo: string }[];
  registo: UseFormRegisterReturn;
  erro?: string;
}) {
  return (
    <fieldset className="grid gap-2" aria-invalid={!!erro}>
      <legend className="rotulo mb-1">{legenda}</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {opcoes.map((o) => (
          <label key={o.id} className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" value={o.id} className="size-4" {...registo} />
            {o.rotulo}
          </label>
        ))}
      </div>
      {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
    </fieldset>
  );
}
