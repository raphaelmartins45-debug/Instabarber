import { textos } from "@/lib/i18n/pt-PT";
import { faturacaoPorDia, totaisPor } from "@/lib/regras/painel-inicio";
import type { Visita } from "@/lib/repositorios/painel/visitas";
import { BarrasMes } from "./barras-mes";
import { GraficoFaturacao } from "./grafico-faturacao";

const t = textos.inicio;

/** A faturação dos últimos 30 dias e o mês por barbeiro e por serviço (Início, D-203). */
export function ResumoMes({
  hoje,
  visitas30,
  visitasMes,
  nomePro,
  nomeServico,
}: {
  hoje: string;
  visitas30: Visita[];
  visitasMes: Visita[];
  nomePro: Record<string, string>;
  nomeServico: Record<string, string>;
}) {
  const cartao = "cartao grid content-start gap-3 rounded-xl p-4";
  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <section className={cartao}>
        <GraficoFaturacao dias={faturacaoPorDia(visitas30, hoje)} />
      </section>
      <section className={cartao}>
        <BarrasMes
          titulo={t.porBarbeiro}
          linhas={totaisPor(visitasMes, (v) => v.profissionalId).map((x) => ({
            nome: nomePro[x.id] ?? "",
            cent: x.cent,
          }))}
        />
        <BarrasMes
          titulo={t.porServico}
          cor="bg-info"
          linhas={totaisPor(visitasMes, (v) => v.servicoId)
            .slice(0, 4)
            .map((x) => ({ nome: nomeServico[x.id] ?? "", cent: x.cent }))}
        />
      </section>
    </div>
  );
}
