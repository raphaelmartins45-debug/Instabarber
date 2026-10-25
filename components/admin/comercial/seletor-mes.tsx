import { Button } from "@/components/ui/button";
import { textos } from "@/lib/i18n/pt-PT";

/** Escolha do mês do desempenho («AAAA-MM»), pelo endereço. */
export function SeletorMes({ mes }: { mes: string }) {
  return (
    <form className="flex flex-wrap items-end gap-2">
      <label className="grid gap-1.5">
        <span className="rotulo">{textos.comercial.desempenho.mes}</span>
        <input
          type="month"
          name="mes"
          defaultValue={mes}
          className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
        />
      </label>
      <Button type="submit" variant="outline" className="h-11">
        {textos.comercial.leads.filtrar}
      </Button>
    </form>
  );
}
