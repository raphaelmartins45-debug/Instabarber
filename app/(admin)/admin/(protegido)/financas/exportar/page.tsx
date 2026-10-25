import { Button } from "@/components/ui/button";
import { mesAtual } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.financas.exportar;
export const metadata = {
  title: `${textos.financas.separadores.exportar} · ${textos.financas.titulo}`,
};

/** Exportar (O.10): escolher o período e descarregar o CSV ou o PDF. */
export default async function Exportar({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; ref?: string }>;
}) {
  const q = await searchParams;
  const periodo = ["mes", "trimestre", "ano"].includes(q.periodo ?? "") ? q.periodo! : "mes";
  const ref = /^\d{4}-\d{2}$/.test(q.ref ?? "") ? q.ref! : mesAtual();
  const ligacao = (formato: string) =>
    `/admin/financas/exportar/ficheiro?formato=${formato}&periodo=${periodo}&ref=${ref}`;
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      <form className="cartao flex flex-wrap items-end gap-3 rounded-2xl p-4">
        <label className="grid gap-1.5">
          <span className="rotulo">{t.tipo}</span>
          <select
            name="periodo"
            defaultValue={periodo}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm"
          >
            {Object.entries(t.tipos).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="rotulo">{t.referencia}</span>
          <input
            type="month"
            name="ref"
            defaultValue={ref}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm"
          />
        </label>
        <Button type="submit" variant="outline" className="h-11">
          {t.preparar}
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={ligacao("csv")}>{t.csv}</a>
        </Button>
        <Button asChild variant="outline">
          <a href={ligacao("pdf")}>{t.pdf}</a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t.naoFiscal}</p>
    </div>
  );
}
