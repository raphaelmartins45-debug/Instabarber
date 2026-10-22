import type { ReactNode } from "react";

// Tabela no computador; abaixo de 768 px, um cartão por registo com pares rótulo-valor (I.3.1).

export type Coluna<T> = { id: string; rotulo: string; valor: (linha: T) => ReactNode };

export function TabelaCartoes<T>({
  colunas,
  linhas,
  chave,
  vazio,
  testId,
}: {
  colunas: Coluna<T>[];
  linhas: T[];
  chave: (linha: T) => string;
  vazio: string;
  testId?: string;
}) {
  if (linhas.length === 0) return <p className="text-sm text-muted-foreground">{vazio}</p>;
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-[11px] tracking-wide text-muted-foreground uppercase">
            <tr>
              {colunas.map((c) => (
                <th key={c.id} scope="col" className="px-3 py-2 font-semibold">
                  {c.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={chave(l)} className="border-b last:border-0" data-testid={testId}>
                {colunas.map((c) => (
                  <td key={c.id} className="px-3 py-2 align-middle">
                    {c.valor(l)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-2 md:hidden">
        {linhas.map((l) => (
          <li
            key={chave(l)}
            className="grid gap-1.5 rounded-lg border bg-card p-3"
            data-testid={testId}
          >
            {colunas.map((c) => (
              <div key={c.id} className="flex justify-between gap-3 text-sm">
                <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  {c.rotulo}
                </span>
                <span className="text-right">{c.valor(l)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}
