"use client";

import { Package, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { ProdutoPublico } from "@/lib/repositorios/barbearias-publicas";
import { Quantidade } from "./quantidade";

/**
 * O detalhe de um produto (D-205): no telemóvel, uma folha que sobe do fundo; no computador, uma
 * janela ao centro. Fecha com o «×», tocando fora ou com Escape.
 */
export function FolhaProduto({
  t,
  p,
  quantidadeAtual,
  aoAdicionar,
  aoFechar,
}: {
  t: TextosPublicos;
  p: ProdutoPublico;
  quantidadeAtual: number;
  aoAdicionar: (q: number) => void;
  aoFechar: () => void;
}) {
  const l = t.loja;
  const [q, setQ] = useState(Math.max(1, quantidadeAtual));
  const fechar = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aoFechar]);
  return (
    <div className="fixed inset-0 z-40 grid items-end md:place-items-center">
      <button
        type="button"
        aria-label={l.fechar}
        tabIndex={-1}
        onClick={aoFechar}
        className="absolute inset-0 bg-black/50 animate-in fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="folha-produto-nome"
        className="relative grid max-h-[90dvh] gap-4 overflow-y-auto rounded-t-[calc(var(--raio)+8px)] bg-card p-4 pb-6 text-card-foreground animate-in slide-in-from-bottom duration-200 md:w-[28rem] md:rounded-[var(--raio)] md:zoom-in-95 md:slide-in-from-bottom-0"
      >
        <span aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-muted md:hidden" />
        <button
          ref={fechar}
          type="button"
          onClick={aoFechar}
          aria-label={l.fechar}
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-card/90"
        >
          <X aria-hidden className="size-5" />
        </button>
        <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[var(--raio)] bg-muted text-muted-foreground">
          {p.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem pública do Storage
            <img src={p.fotoUrl} alt="" className="size-full object-cover" />
          ) : (
            <Package aria-hidden className="size-10" />
          )}
        </div>
        <div className="grid gap-1">
          <h2 id="folha-produto-nome" className="text-xl font-bold">
            {p.nome}
          </h2>
          <p className="numero text-xl font-bold">{formatarDinheiro(p.precoCent)}</p>
          {p.descricao ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{p.descricao}</p>
          ) : null}
        </div>
        {p.esgotado ? (
          <p className="font-semibold text-muted-foreground">{t.blocos.esgotado}</p>
        ) : (
          <div className="grid grid-cols-[auto_1fr] items-center gap-3">
            <Quantidade
              valor={q}
              menos={l.menos}
              mais={l.mais}
              nome={p.nome}
              mudar={(x) => setQ(Math.max(1, x))}
            />
            <button
              type="button"
              onClick={() => aoAdicionar(q)}
              className="h-12 rounded-[var(--raio-botao)] bg-primary px-4 font-semibold text-primary-foreground transition-[filter] hover:brightness-110"
            >
              {l.adicionarValor(formatarDinheiro(p.precoCent * q))}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
