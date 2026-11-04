import Link from "next/link";
import { Button } from "@/components/ui/button";
import { diaPorExtenso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.inicio;

/** O cabeçalho do Início (D-203): o dia, se está aberta agora e as duas ações do balcão. */
export function CabecalhoInicio({
  hoje,
  aberta,
  fecho,
  barbeiros,
}: {
  hoje: string;
  aberta: boolean;
  fecho: string;
  barbeiros: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        <h1 className="text-titulo font-extrabold first-letter:uppercase">{diaPorExtenso(hoje)}</h1>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <span
            className={`inline-flex items-center gap-1.5 font-semibold ${aberta ? "text-sucesso" : ""}`}
          >
            <span aria-hidden className="size-2 rounded-full bg-current" />
            {aberta ? t.cabecalho.aberta(fecho) : t.cabecalho.fechada}
          </span>
          <span>· {t.cabecalho.aTrabalhar(barbeiros)}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="h-11">
          <Link href="/app/agenda/marcar?modo=registar">{textos.agenda.balcao.registar}</Link>
        </Button>
        <Button asChild className="h-11">
          <Link href="/app/agenda/marcar">{textos.agenda.balcao.marcar}</Link>
        </Button>
      </div>
    </div>
  );
}
