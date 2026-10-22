import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mesPorExtenso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.relatorio;

/** A barra de controlo (E.5): setas pelos últimos doze meses, exibir e descarregar o PDF. */
export function BarraRelatorio({
  mes,
  meses,
  base,
  pdf,
}: {
  mes: string;
  /** Os últimos doze meses, do mais recente para o mais antigo. */
  meses: string[];
  base: string;
  pdf: string;
}) {
  const i = meses.indexOf(mes);
  const anterior = meses[i + 1];
  const seguinte = i > 0 ? meses[i - 1] : undefined;
  const seta = (alvo: string | undefined, rotulo: string, icone: React.ReactNode) =>
    alvo ? (
      <Link
        href={`${base}?mes=${alvo}`}
        aria-label={rotulo}
        className="grid size-11 place-items-center rounded-md border bg-card hover:bg-muted"
      >
        {icone}
      </Link>
    ) : (
      <span aria-hidden className="grid size-11 place-items-center rounded-md border opacity-40">
        {icone}
      </span>
    );
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {seta(anterior, t.mesAnterior, <ChevronLeft className="size-4" />)}
      <form action={base} className="flex flex-wrap items-center gap-2">
        <label htmlFor="mes" className="sr-only">
          {t.titulo}
        </label>
        <select
          id="mes"
          name="mes"
          defaultValue={mes}
          className="h-11 rounded-md border bg-card px-3 text-sm capitalize"
        >
          {meses.map((m) => (
            <option key={m} value={m}>
              {mesPorExtenso(m)}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="h-11">
          {t.exibir}
        </Button>
      </form>
      {seta(seguinte, t.mesSeguinte, <ChevronRight className="size-4" />)}
      <Button asChild className="h-11">
        <a href={pdf} data-testid="descarregar-relatorio">
          <Download className="size-4" aria-hidden />
          {t.descarregar}
        </a>
      </Button>
    </div>
  );
}
