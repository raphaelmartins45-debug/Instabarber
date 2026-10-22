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
      <div className="cartao hidden overflow-x-auto rounded-2xl md:block">
        <table className="w-full text-sm">
          <thead className="vidro sticky top-0 border-b text-left text-[11px] tracking-[0.08em] text-terciario uppercase">
            <tr>
              {colunas.map((c) => (
                <th key={c.id} scope="col" className="px-4 py-3 font-semibold">
                  {c.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr
                key={chave(l)}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-foreground/[.03]"
                data-testid={testId}
              >
                {colunas.map((c) => (
                  <td key={c.id} className="numero px-4 py-3 align-middle">
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
          <li key={chave(l)} className="cartao grid gap-2 rounded-2xl p-4" data-testid={testId}>
            {colunas.map((c) => (
              <div key={c.id} className="flex justify-between gap-3 text-sm">
                <span className="rotulo">{c.rotulo}</span>
                <span className="numero text-right">{c.valor(l)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}
