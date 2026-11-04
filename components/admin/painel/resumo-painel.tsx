import Link from "next/link";
import type { ReactNode } from "react";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.painel;

/** Um bloco do painel geral (D-212): título, «ver mais» e uma grelha de indicadores. */
export function BlocoPainel({
  id,
  titulo,
  href,
  children,
}: {
  id: string;
  titulo: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3" aria-labelledby={`painel-${id}`} data-testid={`painel-${id}`}>
      <header className="flex items-baseline justify-between gap-3">
        <h2 id={`painel-${id}`} className="text-secao font-bold">
          {titulo}
        </h2>
        <Link href={href} className="text-sm text-ligacao underline">
          {t.verMais}
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}

export type Etapa = { id: string; rotulo: string; n: number };

/** O funil em barras: quantos leads há em cada etapa (D-212). */
export function FunilResumo({ etapas }: { etapas: Etapa[] }) {
  const maximo = Math.max(1, ...etapas.map((e) => e.n));
  return (
    <div className="cartao col-span-2 grid gap-2 rounded-xl px-4 py-3.5 lg:col-span-4">
      <span className="rotulo">{t.funil}</span>
      <ul className="grid gap-1.5">
        {etapas.map((e) => (
          <li key={e.id} className="grid grid-cols-[8.5rem_minmax(0,1fr)_2rem] items-center gap-2">
            <span className="truncate text-xs text-muted-foreground">{e.rotulo}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-destaque"
                style={{ width: `${(e.n / maximo) * 100}%` }}
              />
            </span>
            <span className="numero text-right text-sm font-semibold">{e.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
