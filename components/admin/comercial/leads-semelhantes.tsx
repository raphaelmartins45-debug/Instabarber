import Link from "next/link";
import { textos } from "@/lib/i18n/pt-PT";
import type { LeadSemelhante } from "@/lib/repositorios/comercial/leads";

const t = textos.comercial.semelhantes;

/** Aviso de duplicado ao criar um lead (D-174). Dos leads de outro comercial, só se sabe que existem. */
export function LeadsSemelhantes({ leads }: { leads: LeadSemelhante[] }) {
  if (leads.length === 0) return null;
  return (
    <div
      role="status"
      className="grid gap-1 rounded-xl border border-alerta/30 bg-alerta/10 p-3"
      data-testid="leads-semelhantes"
    >
      <strong>{t.titulo}</strong>
      <span className="text-sm">{t.ajuda}</span>
      <ul className="grid gap-1 text-sm">
        {leads.map((l) =>
          l.acessivel ? (
            <li key={l.id}>
              {l.nome} ·{" "}
              <Link href={`/admin/comercial/leads/${l.id}`} className="text-ligacao underline">
                {t.abrir}
              </Link>
            </li>
          ) : (
            <li key={l.id}>{t.deOutro}</li>
          ),
        )}
      </ul>
    </div>
  );
}
