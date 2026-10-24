"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";
import { EntradaLateral } from "./entrada-lateral";
import { PastaLateral } from "./pasta-lateral";

const CHAVE = "ib_menu_recolhido";

/** Barra lateral a partir de 768 px: 240 px aberta ou 72 px recolhida, guardado no dispositivo. */
export function MenuLateral({ itens, atual }: { itens: ItemMontado[]; atual: string }) {
  const [recolhido, setRecolhido] = useState(false);

  useEffect(() => {
    try {
      setRecolhido(localStorage.getItem(CHAVE) === "1");
    } catch {
      // Sem armazenamento: fica aberta.
    }
  }, []);

  const alternar = () => {
    setRecolhido((r) => {
      try {
        localStorage.setItem(CHAVE, r ? "0" : "1");
      } catch {
        // Fica só nesta página.
      }
      return !r;
    });
  };

  return (
    <nav
      aria-label={textos.paineis.menuRotulo}
      data-recolhido={recolhido ? "" : undefined}
      className={cn(
        "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col border-r border-border py-4 transition-[width] duration-300 ease-sistema md:flex",
        recolhido ? "w-[72px]" : "w-60",
      )}
    >
      <ul className="grid flex-1 content-start gap-1 overflow-y-auto px-3">
        {itens.map((item) => (
          <li key={item.id} data-menu={item.id}>
            {item.filhos ? (
              <PastaLateral
                pasta={item}
                atual={atual}
                recolhido={recolhido}
                aoAbrirRecolhido={alternar}
              />
            ) : (
              <EntradaLateral item={item} ativo={item.id === atual} recolhido={recolhido} />
            )}
          </li>
        ))}
      </ul>
      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={alternar}
          aria-expanded={!recolhido}
          aria-label={recolhido ? textos.paineis.expandirMenu : textos.paineis.recolherMenu}
          title={recolhido ? textos.paineis.expandirMenu : textos.paineis.recolherMenu}
          className="flex size-10 items-center justify-center rounded-lg text-terciario transition-colors duration-200 ease-sistema hover:bg-foreground/[.06] hover:text-foreground"
        >
          {recolhido ? (
            <PanelLeftOpen aria-hidden className="size-[18px]" />
          ) : (
            <PanelLeftClose aria-hidden className="size-[18px]" />
          )}
        </button>
      </div>
    </nav>
  );
}
