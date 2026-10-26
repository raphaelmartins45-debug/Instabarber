import Link from "next/link";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.painel;

export type Alerta = { texto: string; href: string | null };

/** Alertas do painel geral (E.1): cada um leva ao ecrã onde se resolve, quando existe. */
export function ListaAlertas({ alertas }: { alertas: Alerta[] }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-[15px] font-bold text-ligacao">{t.alertas}</h2>
      {alertas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.semAlertas}</p>
      ) : (
        <ul className="grid gap-2">
          {alertas.map((x) => (
            <li
              key={x.texto}
              className="rounded-lg border border-destaque/40 bg-accent px-3 py-2 text-sm"
            >
              {x.href ? (
                <Link href={x.href} className="underline-offset-4 hover:underline">
                  {x.texto}
                </Link>
              ) : (
                x.texto
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
