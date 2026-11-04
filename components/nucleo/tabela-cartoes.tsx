import type { ReactNode } from "react";

// Tabela no computador; abaixo de 768 px, um cartão por registo (I.3.1): a primeira coluna é o
// título do cartão e as outras ficam em pares rótulo-valor compactos, três por linha (D-183, D-203).

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
  const [primeira, ...resto] = colunas;
  return (
    <>
      <div className="cartao hidden overflow-x-auto rounded-xl md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-campo text-left">
            <tr>
              {colunas.map((c) => (
                <th key={c.id} scope="col" className="rotulo px-4 py-2.5">
                  {c.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr
                key={chave(l)}
                className="border-b border-border/60 transition-colors duration-150 last:border-0 hover:bg-campo"
                data-testid={testId}
              >
                {colunas.map((c) => (
                  <td key={c.id} className="numero px-4 py-2.5 align-middle">
                    {c.valor(l)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="cartao divide-y divide-border overflow-hidden rounded-xl md:hidden">
        {linhas.map((l) => (
          <li key={chave(l)} className="grid gap-1.5 px-4 py-3" data-testid={testId}>
            {primeira ? (
              <div className="numero font-medium [overflow-wrap:anywhere]">{primeira.valor(l)}</div>
            ) : null}
            {resto.length ? (
              <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                {resto.map((c) => (
                  <div key={c.id} className="grid min-w-0 content-start gap-0.5">
                    <dt className="text-xs text-muted-foreground">{c.rotulo}</dt>
                    <dd className="numero [overflow-wrap:anywhere]">{c.valor(l)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
