import type { RelatorioMes } from "@/lib/painel/relatorio-tipos";
import { BarraRelatorio } from "./barra-relatorio";
import { BlocosAtividade } from "./blocos-atividade";
import { BlocosClientes } from "./blocos-clientes";
import { BlocosGestao } from "./blocos-gestao";

/** O relatório mensal no ecrã (E.5): a barra de controlo e os nove blocos. */
export function Relatorio({
  r,
  meses,
  base,
  pdf,
  mensagens,
}: {
  r: RelatorioMes;
  meses: string[];
  base: string;
  pdf: string;
  mensagens: boolean;
}) {
  return (
    <div className="grid gap-8">
      <BarraRelatorio mes={r.mes} meses={meses} base={base} pdf={pdf} />
      <BlocosAtividade r={r} />
      <BlocosClientes r={r} mensagens={mensagens} />
      <BlocosGestao r={r} />
    </div>
  );
}
