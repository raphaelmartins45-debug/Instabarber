"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";
import { IconeMenu } from "./icone-menu";

const VISIVEIS = 5;

/**
 * Navegação inferior abaixo de 768 px (I.3.1): ícone e rótulo curto, no máximo cinco
 * entradas; o resto num menu «Mais». Alvos de toque com 44 px no mínimo.
 */
export function MenuInferior({ itens, atual }: { itens: ItemMontado[]; atual: string }) {
  const [aberto, setAberto] = useState(false);
  const cabem = itens.length <= VISIVEIS;
  const fixos = cabem ? itens : itens.slice(0, VISIVEIS - 1);
  const resto = cabem ? [] : itens.slice(VISIVEIS - 1);
  const restoAtivo = resto.some((i) => i.id === atual);

  return (
    <nav
      aria-label={textos.paineis.menuRotulo}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card md:hidden"
    >
      {aberto ? (
        <ul className="grid gap-1 border-b p-2">
          {resto.map((item) => (
            <li key={item.id} data-menu={item.id}>
              <Entrada item={item} atual={atual} horizontal />
            </li>
          ))}
        </ul>
      ) : null}
      <ul className="flex">
        {fixos.map((item) => (
          <li key={item.id} className="flex-1" data-menu={item.id}>
            <Entrada item={item} atual={atual} />
          </li>
        ))}
        {resto.length ? (
          <li className="flex-1">
            <button
              type="button"
              aria-expanded={aberto}
              onClick={() => setAberto((a) => !a)}
              className={cn(
                "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px]",
                restoAtivo || aberto ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              <Ellipsis aria-hidden className="size-5" />
              {textos.comum.mais}
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

function Entrada({
  item,
  atual,
  horizontal,
}: {
  item: ItemMontado;
  atual: string;
  horizontal?: boolean;
}) {
  const classe = horizontal
    ? "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm"
    : "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center text-[11px] leading-tight";
  if (item.estado === "upgrade") {
    return (
      <span
        aria-disabled="true"
        title={textos.paineis.upgrade}
        className={cn(classe, "text-muted-foreground/60")}
      >
        <IconeMenu id={item.id} className="size-5" />
        {item.rotulo}
      </span>
    );
  }
  const ativo = item.id === atual;
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        classe,
        ativo ? "font-semibold text-foreground" : "text-muted-foreground",
        horizontal && ativo && "bg-accent",
      )}
    >
      <IconeMenu id={item.id} className={cn("size-5", ativo && "text-destaque")} />
      {item.rotulo}
    </Link>
  );
}
