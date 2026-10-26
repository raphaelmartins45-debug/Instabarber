import Link from "next/link";
import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comprovativos.admin;

export type ComprovativoPendente = { id: string; nome: string; detalhe: string };

/** Comprovativos por confirmar no painel geral (D-168): cada um abre-se para conferir e decidir. */
export function ComprovativosPendentes({ linhas }: { linhas: ComprovativoPendente[] }) {
  return (
    <section className="grid gap-2" data-testid="painel-comprovativos">
      <h2 className="text-[15px] font-bold text-ligacao">{t.painel}</h2>
      {linhas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.semPainel}</p>
      ) : (
        <ul className="grid gap-2">
          {linhas.map((x) => (
            <li
              key={x.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
              data-testid="painel-comprovativo"
            >
              <div className="grid min-w-0 gap-0.5">
                <span className="truncate font-semibold">{x.nome}</span>
                <span className="text-xs text-muted-foreground">{x.detalhe}</span>
              </div>
              <Button asChild className="h-11 shrink-0">
                <Link href={`/admin/pagamentos/comprovativos/${x.id}`}>{t.conferir}</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
