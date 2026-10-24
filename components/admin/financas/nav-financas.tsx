"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

const t = textos.financas;

// Separadores das Finanças (O.2). Entram à medida que cada camada da Fase 3C fica pronta.
const SEPARADORES = [
  { id: "resumo", href: "/admin/financas" },
  { id: "custos", href: "/admin/financas/custos" },
  { id: "vencimentos", href: "/admin/financas/vencimentos" },
] as const;

/** Separadores das Finanças; no telemóvel deslizam na horizontal. */
export function NavFinancas() {
  const caminho = usePathname();
  const atual =
    [...SEPARADORES].reverse().find((s) => caminho === s.href || caminho.startsWith(`${s.href}/`))
      ?.id ?? SEPARADORES[0].id;
  return (
    <nav aria-label={t.titulo} className="-mx-4 overflow-x-auto border-b px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1">
        {SEPARADORES.map((s) => (
          <li key={s.id}>
            <Link
              href={s.href}
              aria-current={s.id === atual ? "page" : undefined}
              className={cn(
                "flex h-11 items-center border-b-2 px-3 text-sm whitespace-nowrap",
                s.id === atual
                  ? "border-destaque font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.separadores[s.id]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
