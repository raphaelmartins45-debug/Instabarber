/** Lista de escolha com a etiqueta em maiúsculas pequenas por cima (I.2). */
export function Selecao({
  id,
  rotulo,
  valor,
  aoMudar,
  opcoes,
}: {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  opcoes: { id: string; rotulo: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="rotulo">
        {rotulo}
      </label>
      <select
        id={id}
        className="h-11 rounded-md border border-input bg-foreground/[.03] px-3 text-sm text-foreground transition-colors hover:border-foreground/25 focus-visible:border-ring"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
      >
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}
