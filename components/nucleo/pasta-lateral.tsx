"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { cn } from "@/lib/utils";
import { EntradaLateral } from "./entrada-lateral";
import { IconeMenu } from "./icone-menu";

/**
 * Uma pasta da barra lateral (ex.: «Gestão do negócio»): abre e fecha, e começa aberta quando o
 * ecrã atual está lá dentro. Com a barra recolhida, um toque abre a barra e a pasta.
 */
export function PastaLateral({
  pasta,
  atual,
  recolhido,
  aoAbrirRecolhido,
}: {
  pasta: ItemMontado;
  atual: string;
  recolhido: boolean;
  aoAbrirRecolhido: () => void;
}) {
  const filhos = pasta.filhos ?? [];
  const contemAtual = filhos.some((f) => f.id === atual);
  const [aberta, setAberta] = useState(contemAtual);
  const id = `pasta-${pasta.id}`;

  const alternar = () => {
    if (recolhido) {
      aoAbrirRecolhido();
      setAberta(true);
    } else setAberta((a) => !a);
  };

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberta && !recolhido}
        aria-controls={id}
        title={recolhido ? pasta.rotulo : undefined}
        className={cn(
          "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors duration-200 ease-sistema hover:bg-foreground/[.05] hover:text-foreground",
          contemAtual ? "font-semibold text-foreground" : "text-muted-foreground",
          recolhido && "justify-center px-0",
        )}
      >
        <IconeMenu
          id={pasta.id}
          className={cn("size-[18px] shrink-0", contemAtual && "text-ligacao")}
        />
        {recolhido ? (
          <span className="sr-only">{pasta.rotulo}</span>
        ) : (
          <>
            <span className="truncate">{pasta.rotulo}</span>
            <ChevronDown
              aria-hidden
              className={cn(
                "ml-auto size-4 transition-transform duration-200 ease-sistema",
                aberta && "rotate-180",
              )}
            />
          </>
        )}
      </button>
      {aberta && !recolhido ? (
        <ul id={id} className="grid gap-1">
          {filhos.map((f) => (
            <li key={f.id} data-menu={f.id}>
              <EntradaLateral item={f} ativo={f.id === atual} recolhido={false} dentro />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
