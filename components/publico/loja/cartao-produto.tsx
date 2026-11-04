"use client";

import { Package, Plus } from "lucide-react";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { ProdutoPublico } from "@/lib/repositorios/barbearias-publicas";
import { cn } from "@/lib/utils";
import { Quantidade } from "./quantidade";

/**
 * Um produto na montra (D-205): fotografia quadrada, nome, preço e «Adicionar», que passa a
 * «− 1 +» quando já está no saco. Tocar na fotografia ou no nome abre o detalhe.
 */
export function CartaoProduto({
  t,
  p,
  quantidade,
  mudar,
  abrir,
}: {
  t: TextosPublicos;
  p: ProdutoPublico;
  quantidade: number;
  mudar: (q: number) => void;
  abrir: () => void;
}) {
  const l = t.loja;
  return (
    <li
      className={cn(
        "cartao-modelo grid content-start overflow-hidden rounded-[var(--raio)] border bg-card text-card-foreground",
        p.esgotado && "opacity-60",
      )}
      data-testid="produto-loja"
    >
      <button
        type="button"
        onClick={abrir}
        className="relative grid aspect-square place-items-center bg-muted text-muted-foreground"
        aria-label={p.nome}
      >
        {p.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
          <img src={p.fotoUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <Package aria-hidden className="size-8" />
        )}
        {p.esgotado ? (
          <span className="absolute top-2 left-2 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-card-foreground">
            {t.blocos.esgotado}
          </span>
        ) : null}
      </button>
      <div className="grid gap-2 p-3">
        <button type="button" onClick={abrir} className="grid text-left">
          <span className="truncate text-sm font-semibold">{p.nome}</span>
          <span className="numero text-base font-bold">{formatarDinheiro(p.precoCent)}</span>
        </button>
        {p.esgotado ? (
          <span className="grid h-11 place-items-center rounded-[var(--raio-botao)] bg-muted text-sm font-semibold text-muted-foreground">
            {l.indisponivel}
          </span>
        ) : quantidade > 0 ? (
          <Quantidade
            valor={quantidade}
            menos={l.menos}
            mais={l.mais}
            nome={p.nome}
            mudar={mudar}
            cheio
          />
        ) : (
          <button
            type="button"
            onClick={() => mudar(1)}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[var(--raio-botao)] bg-primary text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-110 active:translate-y-px"
          >
            <Plus aria-hidden className="size-4" />
            {l.adicionar}
          </button>
        )}
      </div>
    </li>
  );
}
