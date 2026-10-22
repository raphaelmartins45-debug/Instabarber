import { textos } from "@/lib/i18n/pt-PT";
import { listarPeriodos } from "@/lib/repositorios/painel/calendario";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { PeriodosDesconto } from "./periodos-desconto";

/** Preços por período de ocupação (F.4.7): descontos nas horas de pouca procura. */
export async function SeccaoPeriodos({ inquilinoId }: { inquilinoId: string }) {
  const periodos = await listarPeriodos(await criarClienteServidor(), inquilinoId);
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">{textos.sistema.periodos.ajuda}</p>
      <PeriodosDesconto periodos={periodos} />
    </div>
  );
}
