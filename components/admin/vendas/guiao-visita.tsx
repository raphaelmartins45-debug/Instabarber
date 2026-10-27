import Link from "next/link";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.vendas.guiao;

/** Guião da visita (D-181): os sete passos, do Instagram à próxima ação com data. */
export function GuiaoVisita() {
  return (
    <div className="grid gap-3" data-testid="guiao-visita">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <ol className="grid gap-3">
        {t.passos.map((p, i) => (
          <li key={p.titulo} className="grid grid-cols-[2rem_1fr] gap-3">
            <span className="numero flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
              {i + 1}
            </span>
            <div className="grid gap-0.5">
              <p className="font-semibold">{p.titulo}</p>
              <p className="text-sm text-muted-foreground">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
      <Button asChild variant="outline" className="justify-self-start">
        <Link href="/admin/comercial/leads/novo">{t.novoLead}</Link>
      </Button>
    </div>
  );
}
