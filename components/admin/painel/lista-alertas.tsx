import { ChevronRight, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.painel;

export type Alerta = { texto: string; href: string | null };

/**
 * Alertas do painel geral (E.1): uma lista num cartão, cada linha inteira leva ao ecrã onde o
 * alerta se resolve (D-183).
 */
export function ListaAlertas({ alertas }: { alertas: Alerta[] }) {
  return (
    <section className="grid gap-2" aria-labelledby="painel-alertas">
      <h2 id="painel-alertas" className="text-secao font-bold">
        {t.alertas}
      </h2>
      {alertas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.semAlertas}</p>
      ) : (
        <ul className="cartao divide-y divide-border overflow-hidden rounded-xl">
          {alertas.map((x) => {
            const conteudo = (
              <>
                <TriangleAlert aria-hidden className="size-4 shrink-0 text-alerta" />
                <span className="min-w-0 flex-1">{x.texto}</span>
                {x.href ? (
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-terciario" />
                ) : null}
              </>
            );
            const classe = "flex min-h-11 items-center gap-3 px-4 py-2.5 text-sm";
            return (
              <li key={x.texto}>
                {x.href ? (
                  <Link
                    href={x.href}
                    className={`${classe} transition-colors duration-150 hover:bg-campo`}
                  >
                    {conteudo}
                  </Link>
                ) : (
                  <div className={classe}>{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
