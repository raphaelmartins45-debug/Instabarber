"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { escolherLingua } from "@/app/(publico)/b/[slug]/acoes";
import { LINGUAS, type Lingua } from "@/lib/i18n/publico";
import { cn } from "@/lib/utils";

/** Seletor manual PT · EN · FR (I.3.2): troca a língua sem recarregar a página. */
export function SeletorLingua({ atual, rotulo }: { atual: Lingua; rotulo: string }) {
  const router = useRouter();
  const [aMudar, iniciar] = useTransition();
  return (
    <div role="group" aria-label={rotulo} className="flex gap-1">
      {LINGUAS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === atual}
          disabled={aMudar}
          onClick={() =>
            iniciar(async () => {
              await escolherLingua(l);
              router.refresh();
            })
          }
          className={cn(
            "h-10 min-w-11 rounded-md border px-2 text-xs font-bold uppercase",
            l === atual && "bg-foreground text-background",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
