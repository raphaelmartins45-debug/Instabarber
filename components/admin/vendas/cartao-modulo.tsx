import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.vendas;

/** Um módulo na visão geral: o ícone, o nome, o que faz e a entrada inteira clicável. */
export function CartaoModulo({
  id,
  href,
  icone: Icone,
}: {
  id: string;
  href: string;
  icone: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="cartao group grid min-h-28 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl p-4 transition-[border-color,transform] duration-200 ease-sistema hover:border-destaque/50 active:scale-[0.98]"
      data-testid={`cartao-${id}`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destaque/12 text-destaque">
        <Icone className="size-5" aria-hidden />
      </span>
      <span className="grid content-start gap-1">
        <span className="flex items-center justify-between gap-2 font-semibold">
          {t.modulos[id]}
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-sistema group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
        <span className="text-sm text-muted-foreground">{t.resumos[id]}</span>
      </span>
    </Link>
  );
}
