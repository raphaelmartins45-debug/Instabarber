import Link from "next/link";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

/**
 * Menu montado a partir das funcionalidades ativas (D.3). No telemóvel é uma faixa que
 * desliza na horizontal; as entradas «upgrade» ficam desativadas com a chamada do plano Pro.
 */
export function MenuPainel({ itens, atual }: { itens: ItemMontado[]; atual: string }) {
  return (
    <nav aria-label={textos.paineis.menuRotulo} className="border-b bg-card">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
        {itens.map((item) => (
          <li key={item.id} className="shrink-0" data-menu={item.id}>
            {item.estado === "upgrade" ? (
              <span
                aria-disabled="true"
                title={textos.paineis.upgrade}
                className="flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground"
              >
                {item.rotulo}
                <span className="rounded bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-ligacao">
                  {textos.paineis.etiquetaPro}
                </span>
              </span>
            ) : (
              <Link
                href={item.href}
                aria-current={item.id === atual ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center rounded-md px-3 text-sm",
                  item.id === atual ? "bg-accent font-semibold" : "hover:bg-muted",
                )}
              >
                {item.rotulo}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
