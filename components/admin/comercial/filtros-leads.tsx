import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial;

const CAMPO = "h-11 rounded-lg border border-input bg-card px-3 text-sm";

/**
 * Pesquisa e filtros dos leads (N.3). O filtro por responsável só aparece aos administradores
 * (D-161); o comercial já só vê os seus.
 */
export function FiltrosLeads({
  q,
  estado,
  vista,
  responsavel,
  comerciais,
}: {
  q: string;
  estado: string;
  vista: string;
  responsavel: string;
  comerciais: { userId: string; nome: string }[] | null;
}) {
  return (
    <form className="cartao flex flex-wrap items-end gap-3 rounded-2xl p-4">
      <input type="hidden" name="vista" value={vista} />
      <label className="grid min-w-56 flex-1 gap-1.5">
        <span className="rotulo">{t.leads.pesquisar}</span>
        <input
          name="q"
          defaultValue={q}
          className="h-11 rounded-lg border border-input bg-foreground/[.03] px-3 text-sm"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="rotulo">{t.leads.colunas.estado}</span>
        <select name="estado" defaultValue={estado} className={CAMPO}>
          <option value="">{t.leads.todos}</option>
          {Object.entries(t.estados).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
      </label>
      {comerciais ? (
        <label className="grid gap-1.5">
          <span className="rotulo">{t.leads.colunas.responsavel}</span>
          <select name="responsavel" defaultValue={responsavel} className={CAMPO}>
            <option value="">{t.leads.todos}</option>
            <option value="sem">{t.leads.semResponsavel}</option>
            {comerciais.map((c) => (
              <option key={c.userId} value={c.userId}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <Button type="submit" className="h-11">
        {t.leads.filtrar}
      </Button>
    </form>
  );
}
