import Link from "next/link";
import { textos } from "@/lib/i18n/pt-PT";
import type { Seccao } from "@/lib/painel/sistema";
import { cn } from "@/lib/utils";

const t = textos.sistema;

/** As secções da Gestão do sistema: botões em linha, com deslocamento horizontal no telemóvel. */
export function NavSeccoes({ seccoes, atual }: { seccoes: Seccao[]; atual: string }) {
  return (
    <nav aria-label={t.secoesRotulo} className="flex gap-2 overflow-x-auto pb-1">
      {seccoes.map((s) => (
        <Link
          key={s.id}
          href={s.id === "loja" ? "/app/loja" : `/app/sistema/${s.id}`}
          aria-current={s.id === atual ? "page" : undefined}
          className={cn(
            "flex h-10 shrink-0 items-center rounded-full border px-4 text-sm",
            s.id === atual
              ? "border-foreground bg-foreground text-background"
              : "bg-card hover:bg-muted",
          )}
        >
          {t.secoes[s.id]}
        </Link>
      ))}
    </nav>
  );
}
