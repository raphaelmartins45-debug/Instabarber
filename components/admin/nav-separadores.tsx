"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SEPARADORES } from "@/lib/admin/ficha";
import { textos } from "@/lib/i18n/pt-PT";
import { cn } from "@/lib/utils";

const t = textos.admin.ficha;

/** Dez separadores no computador; no telemóvel, fluxo de passos com indicador de posição (I.3.1). */
export function NavSeparadores({ inquilinoId }: { inquilinoId: string }) {
  const atual = usePathname().split("/")[4] ?? "identidade";
  const indice = Math.max(0, SEPARADORES.indexOf(atual as (typeof SEPARADORES)[number]));
  const href = (s: string) => `/admin/barbearias/${inquilinoId}/${s}`;
  const anterior = SEPARADORES[indice - 1];
  const seguinte = SEPARADORES[indice + 1];
  return (
    <>
      <nav aria-label={t.navegacao} className="hidden overflow-x-auto border-b md:block">
        <ul className="flex gap-1">
          {SEPARADORES.map((s) => (
            <li key={s}>
              <Link
                href={href(s)}
                aria-current={s === atual ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center border-b-2 px-3 text-sm whitespace-nowrap",
                  s === atual
                    ? "border-destaque font-semibold"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {t.separadores[s]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-2 md:hidden">
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {t.separadorDe(indice + 1, SEPARADORES.length)} · {t.separadores[SEPARADORES[indice]!]}
        </p>
        <div className="flex gap-1">
          {SEPARADORES.map((s, i) => (
            <span
              key={s}
              className={cn("h-1.5 flex-1 rounded-full", i <= indice ? "bg-destaque" : "bg-border")}
            />
          ))}
        </div>
        <div className="flex justify-between gap-2">
          {anterior ? (
            <Button asChild variant="outline" className="h-11 flex-1">
              <Link href={href(anterior)}>{t.anterior}</Link>
            </Button>
          ) : (
            <span className="flex-1" />
          )}
          {seguinte ? (
            <Button asChild variant="outline" className="h-11 flex-1">
              <Link href={href(seguinte)}>{t.seguinte}</Link>
            </Button>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      </div>
    </>
  );
}
