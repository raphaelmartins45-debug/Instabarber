"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { encomendar } from "@/app/(publico)/b/[slug]/loja/acoes";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textosPublicos, type Lingua } from "@/lib/i18n/publico";
import type { ProdutoPublico } from "@/lib/repositorios/barbearias-publicas";
import { FormularioContacto } from "../formulario-contacto";
import { Quantidade } from "./quantidade";

/** A encomenda da loja (F.4.4): quantidades, total a pagar ao balcão e os dados de contacto. */
export function Carrinho({
  lingua,
  slug,
  produtos,
  cliente,
  voltar,
}: {
  lingua: Lingua;
  slug: string;
  produtos: ProdutoPublico[];
  cliente: { nome: string; telefone: string } | null;
  voltar: string;
}) {
  const t = textosPublicos(lingua);
  const l = t.loja;
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [erro, setErro] = useState<string>();
  const [feita, setFeita] = useState(false);
  const [aEnviar, iniciar] = useTransition();
  const linhas = Object.entries(quantidades)
    .filter(([, q]) => q > 0)
    .map(([produtoId, quantidade]) => ({ produtoId, quantidade }));
  // O total mostra-se para o cliente saber quanto paga; o que conta é o da base de dados.
  const total = linhas.reduce(
    (s, x) => s + (produtos.find((p) => p.id === x.produtoId)?.precoCent ?? 0) * x.quantidade,
    0,
  );
  if (feita)
    return (
      <div className="grid gap-3" data-testid="encomenda-feita">
        <h2 className="text-xl font-extrabold">{l.feita}</h2>
        <p className="text-sm text-muted-foreground">{l.feitaAjuda}</p>
        <Link href={voltar} className="font-semibold underline underline-offset-4">
          {l.voltar}
        </Link>
      </div>
    );
  return (
    <div className="grid gap-6">
      <ul className="grid gap-2">
        {produtos.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3"
          >
            <span className="grid">
              <span className="font-semibold">{p.nome}</span>
              <span className="text-sm text-muted-foreground">
                {p.esgotado ? t.blocos.esgotado : formatarDinheiro(p.precoCent)}
              </span>
            </span>
            {p.esgotado ? null : (
              <Quantidade
                valor={quantidades[p.id] ?? 0}
                menos={l.menos}
                mais={l.mais}
                nome={p.nome}
                mudar={(q) => setQuantidades({ ...quantidades, [p.id]: q })}
              />
            )}
          </li>
        ))}
      </ul>
      <p className="text-lg font-bold" data-testid="total-encomenda">
        {l.total(formatarDinheiro(total))}
      </p>
      <h2 className="text-lg font-extrabold">{l.dados}</h2>
      <FormularioContacto
        t={t}
        prefixo="lj"
        inicial={cliente ?? undefined}
        submeter={l.encomendar}
        erro={erro}
        aEnviar={aEnviar}
        aoEnviar={(c) =>
          iniciar(async () => {
            if (!linhas.length) return setErro(l.vazio);
            const r = await encomendar(slug, { ...c, linhas });
            if (r.ok) return setFeita(true);
            setErro(t.marcacao.erros[r.erro] ?? t.marcacao.erros.erro);
          })
        }
      />
    </div>
  );
}
