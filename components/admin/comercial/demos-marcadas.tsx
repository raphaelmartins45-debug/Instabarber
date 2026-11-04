import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { hojeIso, horaCurta, quandoPorExtenso, somarDias } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { Lead } from "@/lib/repositorios/comercial/leads";

const t = textos.comercial.marcarDemo;

/**
 * As demonstrações marcadas (D-211): hoje e nos próximos 7 dias, pela hora, no Funil do comercial
 * e no painel geral. As de hoje ficam realçadas: são os compromissos do dia.
 */
export function DemosMarcadas({ leads }: { leads: Lead[] }) {
  const hoje = hojeIso();
  const limite = somarDias(hoje, 7);
  const demos = leads
    .filter((l) => l.estado === "demo_marcada" && l.demo_em)
    .filter((l) => {
      const dia = hojeIso(new Date(l.demo_em!));
      return dia >= hoje && dia <= limite;
    })
    .sort((a, b) => a.demo_em!.localeCompare(b.demo_em!));
  return (
    <section className="cartao grid gap-3 rounded-2xl p-4" data-testid="demos-marcadas">
      <header className="flex items-center gap-2">
        <CalendarClock aria-hidden className="size-4 text-destaque" />
        <h2 className="text-sm font-bold">{t.proximas}</h2>
        <span className="text-xs text-muted-foreground">{t.proximasAjuda}</span>
      </header>
      {demos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.nenhuma}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {demos.map((l) => {
            const eHoje = hojeIso(new Date(l.demo_em!)) === hoje;
            return (
              <li key={l.id}>
                <Link
                  href={`/admin/comercial/leads/${l.id}`}
                  className={`flex items-center gap-3 rounded-xl border p-3 hover:bg-campo ${eHoje ? "border-destaque/60 bg-accent/40" : "bg-card"}`}
                >
                  <span className="numero grid min-w-14 place-items-center rounded-lg bg-accent px-2 py-1.5 text-sm font-bold text-destaque">
                    {horaCurta(l.demo_em!)}
                  </span>
                  <span className="grid min-w-0">
                    <span className="truncate font-semibold">
                      {l.nome_barbearia || l.nome_contacto}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {eHoje ? t.hoje : quandoPorExtenso(l.demo_em!)} · {l.nome_contacto}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
