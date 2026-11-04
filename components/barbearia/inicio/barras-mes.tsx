import { formatarDinheiro } from "@/lib/formatacao/dinheiro";

/** Barras horizontais com o valor de cada linha (D-203): por barbeiro ou por serviço. */
export function BarrasMes({
  titulo,
  linhas,
  cor = "bg-destaque",
}: {
  titulo: string;
  linhas: { nome: string; cent: number }[];
  cor?: string;
}) {
  const max = Math.max(1, ...linhas.map((l) => l.cent));
  if (linhas.length === 0) return null;
  return (
    <section className="grid gap-2.5">
      <h2 className="text-sm font-bold">{titulo}</h2>
      <ul className="grid gap-2">
        {linhas.map((l) => (
          <li key={l.nome} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate">{l.nome}</span>
            <span className="h-2 rounded-full bg-muted">
              <span
                className={`block h-full rounded-full ${cor}`}
                style={{ width: `${(l.cent / max) * 100}%` }}
              />
            </span>
            <span className="numero text-right font-semibold">{formatarDinheiro(l.cent)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
