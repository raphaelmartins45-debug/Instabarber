import type { ReactNode } from "react";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.vendas;

/** A moldura de um módulo: título, a frase do que faz e o conteúdo num cartão. */
export function ModuloVendas({
  id,
  ajuda,
  largo,
  children,
}: {
  id: string;
  ajuda?: string;
  largo?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`modulo-${id}`}
      className={largo ? "grid gap-4" : "grid max-w-3xl gap-4"}
      data-testid={`modulo-${id}`}
    >
      <header className="grid gap-1">
        <h2 id={`modulo-${id}`} className="text-lg font-bold tracking-tight">
          {t.modulos[id]}
        </h2>
        <p className="text-sm text-muted-foreground">{ajuda ?? t.resumos[id]}</p>
      </header>
      <div className="cartao rounded-2xl p-4 sm:p-5">{children}</div>
    </section>
  );
}
