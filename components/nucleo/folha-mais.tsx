"use client";

import { X } from "lucide-react";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { EntradaInferior } from "./entrada-inferior";
import { IconeMenu } from "./icone-menu";

/**
 * A folha «Mais» da barra de baixo (D-183): sobe por cima da barra, com pega, título e fechar;
 * as pastas são secções com o título por cima. Entra em 200 ms e respeita o movimento reduzido.
 */
export function FolhaMais({
  resto,
  pastas,
  atual,
  aoFechar,
}: {
  resto: ItemMontado[];
  pastas: ItemMontado[];
  atual: string;
  aoFechar: () => void;
}) {
  return (
    <div
      id="menu-mais"
      role="dialog"
      aria-modal="true"
      aria-label={textos.comum.mais}
      className="flutuante fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 grid max-h-[70dvh] grid-rows-[auto_minmax(0,1fr)] rounded-t-2xl border-b-0 shadow-flutuante transition-[transform,opacity] duration-200 ease-sistema starting:translate-y-4 starting:opacity-0 md:hidden"
    >
      <div className="grid gap-2 px-4 pt-2 pb-1">
        <span aria-hidden className="mx-auto h-1 w-9 rounded-full bg-foreground/15" />
        <div className="flex items-center justify-between">
          <p className="text-secao font-bold">{textos.comum.mais}</p>
          <button
            type="button"
            onClick={aoFechar}
            aria-label={textos.comum.fechar}
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/6 hover:text-foreground"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
      </div>
      <div className="overflow-y-auto overscroll-contain px-2 pb-3">
        {resto.length ? (
          <ul className="grid gap-0.5">
            {resto.map((item) => (
              <li key={item.id} data-menu={item.id}>
                <EntradaInferior item={item} atual={atual} horizontal />
              </li>
            ))}
          </ul>
        ) : null}
        {pastas.map((pasta) => (
          <section
            key={pasta.id}
            aria-label={pasta.rotulo}
            className="mt-2 grid gap-0.5 border-t border-border pt-2"
            data-menu={pasta.id}
          >
            <p className="rotulo flex items-center gap-2 px-3 py-1.5">
              <IconeMenu id={pasta.id} className="size-4" />
              {pasta.rotulo}
            </p>
            <ul className="grid gap-0.5">
              {pasta.filhos!.map((f) => (
                <li key={f.id} data-menu={f.id}>
                  <EntradaInferior item={f} atual={atual} horizontal />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
