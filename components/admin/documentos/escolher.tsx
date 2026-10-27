import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.documentos.ecra;

/**
 * Escolher um lead ou uma barbearia: um formulário GET que abre a página com o parâmetro (funciona
 * sem JavaScript). Os outros parâmetros mantêm-se em campos escondidos.
 */
export function Escolher({
  nome,
  rotulo,
  opcoes,
  atual,
  manter,
}: {
  nome: string;
  rotulo: string;
  opcoes: { id: string; rotulo: string }[];
  atual: string | null;
  manter: Record<string, string | null>;
}) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-2">
      {Object.entries(manter).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <div className="grid min-w-0 flex-1 gap-1.5 sm:max-w-sm">
        <label htmlFor={`escolher-${nome}`} className="rotulo">
          {rotulo}
        </label>
        <select
          id={`escolher-${nome}`}
          name={nome}
          defaultValue={atual ?? ""}
          className="h-11 w-full min-w-0 rounded-md border border-input bg-foreground/[.03] px-3 text-sm"
        >
          <option value="">{t.escolher}</option>
          {opcoes.map((o) => (
            <option key={o.id} value={o.id}>
              {o.rotulo}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="outline" className="h-11">
        {t.abrir}
      </Button>
    </form>
  );
}
