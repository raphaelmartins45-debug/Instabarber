"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";
import { MODULOS_VENDAS } from "./modulos";

const t = textos.vendas;

/** Separadores do Apoio às vendas: a visão geral e um por módulo. No telemóvel deslizam. */
export function NavVendas() {
  const caminho = usePathname();
  const itens = [{ id: "geral", href: "/admin/vendas" }, ...MODULOS_VENDAS];
  const atual =
    [...itens].reverse().find((i) => caminho === i.href || caminho.startsWith(`${i.href}/`))?.id ??
    "geral";
  return (
    <nav aria-label={t.titulo} className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1">
        {itens.map((i) => (
          <li key={i.id}>
            <Link
              href={i.href}
              aria-current={i.id === atual ? "page" : undefined}
              className={cn(
                "flex h-11 items-center border-b-2 px-3 text-sm whitespace-nowrap transition-colors duration-150",
                i.id === atual
                  ? "border-destaque font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.modulos[i.id]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
