"use client";

import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { ProdutoPublico } from "@/lib/repositorios/barbearias-publicas";
import { FormularioContacto } from "../formulario-contacto";
import { Quantidade } from "./quantidade";

export type LinhaSaco = { produto: ProdutoPublico; quantidade: number };
type Contacto = Parameters<Parameters<typeof FormularioContacto>[0]["aoEnviar"]>[0];

/**
 * O saco (D-205): os produtos escolhidos, com a quantidade a mudar, o total a pagar ao balcão e
 * os dados do cliente para fechar a encomenda.
 */
export function Saco({
  t,
  linhas,
  totalCent,
  mudar,
  cliente,
  erro,
  aEnviar,
  aoEnviar,
}: {
  t: TextosPublicos;
  linhas: LinhaSaco[];
  totalCent: number;
  mudar: (produtoId: string, q: number) => void;
  cliente: { nome: string; telefone: string } | null;
  erro?: string;
  aEnviar: boolean;
  aoEnviar: (c: Contacto) => void;
}) {
  const l = t.loja;
  if (linhas.length === 0) return <p className="text-sm text-muted-foreground">{l.sacoVazio}</p>;
  return (
    <div className="grid gap-4">
      <ul className="grid divide-y">
        {linhas.map(({ produto: p, quantidade }) => (
          <li key={p.id} className="flex items-center gap-3 py-3">
            <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[calc(var(--raio)/2)] bg-muted">
              {p.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
                <img src={p.fotoUrl} alt="" className="size-full object-cover" />
              ) : null}
            </span>
            <span className="grid min-w-0 flex-1">
              <span className="line-clamp-2 text-sm font-semibold">{p.nome}</span>
              <span className="numero text-sm text-muted-foreground">
                {formatarDinheiro(p.precoCent * quantidade)}
              </span>
            </span>
            <Quantidade
              valor={quantidade}
              menos={l.menos}
              mais={l.mais}
              nome={p.nome}
              mudar={(q) => mudar(p.id, q)}
            />
          </li>
        ))}
      </ul>
      <p
        className="flex items-baseline justify-between gap-3 border-t pt-3 text-lg font-bold"
        data-testid="total-encomenda"
      >
        <span>{l.totalCurto}</span>
        <span className="numero">{formatarDinheiro(totalCent)}</span>
      </p>
      <h3 className="text-base font-bold">{l.dados}</h3>
      <FormularioContacto
        t={t}
        prefixo="lj"
        inicial={cliente ?? undefined}
        submeter={l.encomendar}
        erro={erro}
        aEnviar={aEnviar}
        aoEnviar={aoEnviar}
      />
    </div>
  );
}
