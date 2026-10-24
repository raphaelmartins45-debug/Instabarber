import { GraficoFinancas } from "@/components/admin/financas/grafico-financas";
import { PontoEquilibrio } from "@/components/admin/financas/ponto-equilibrio";
import { Indicador } from "@/components/nucleo/indicador";
import { Secao } from "@/components/nucleo/secao";
import { Button } from "@/components/ui/button";
import {
  distribuicaoPorPlano,
  resumoDoMes,
  serieMensal,
  valorMedio,
} from "@/lib/financas/indicadores";
import { previsaoPorOmissao } from "@/lib/financas/previsao-base";
import {
  mesAnterior,
  mesAtual,
  mesPorExtenso,
  nomeDoMes,
  ultimosMeses,
} from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarPercentagem } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { mesDoEquilibrio, projetar } from "@/lib/regras/previsao";
import {
  barbeariasParaFinancas,
  listarContas,
  listarCustos,
  recebimentosDesde,
} from "@/lib/repositorios/financas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.financas;
export const metadata = { title: `${t.separadores.resumo} · ${t.titulo}` };

/** Resumo (O.5) e ponto de equilíbrio (O.6), sempre sem IVA. */
export default async function Resumo({
  searchParams,
}: {
  searchParams: Promise<{ basic?: string }>;
}) {
  const { basic } = await searchParams;
  const regime = lerRegimeIva(process.env.PRESTADORA_REGIME_IVA);
  const mes = mesAtual();
  const meses = ultimosMeses(12).reverse();
  const bd = await criarClienteServidor();
  const [barbearias, custos, contas, recebimentos] = await Promise.all([
    barbeariasParaFinancas(bd),
    listarCustos(bd),
    listarContas(bd),
    recebimentosDesde(bd, `${mes}-01`),
  ]);
  const r = resumoDoMes({
    barbearias,
    recebimentos,
    custos,
    contas,
    mes,
    mesAnterior: mesAnterior(mes),
    regime,
  });
  const serie = serieMensal(meses, barbearias, custos, regime).map((m) => ({
    ...m,
    rotulo: nomeDoMes(m.mes).slice(0, 3),
  }));
  const planos = distribuicaoPorPlano(barbearias);
  const percentBasic =
    r.arpu === null ? Math.min(100, Math.max(0, Number(basic ?? 50) || 0)) : null;
  const vazio = t.resumo.semValor;
  // O mês em que a previsão base (O.8, pressupostos por omissão) chega ao equilíbrio.
  const base = previsaoPorOmissao(barbearias, custos, mes, r.saidas);
  const previsto = mesDoEquilibrio(
    projetar(
      r.mrr,
      {
        novas: base.novas,
        saidas: base.saidas,
        valorMedio: valorMedio(r.arpu, percentBasic ?? 50, regime),
      },
      base.meses,
      base.custos,
    ),
  );

  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">{t.resumo.semIva}</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="resumo">
        <Indicador
          rotulo={t.resumo.mrr}
          valor={formatarDinheiro(r.mrr)}
          detalhe={t.resumo.mrrDetalhe(r.ativas)}
        />
        <Indicador rotulo={t.resumo.recebido} valor={formatarDinheiro(r.recebido)} />
        <Indicador
          rotulo={t.resumo.custos}
          valor={formatarDinheiro(r.custos.total)}
          detalhe={t.resumo.custosDetalhe(
            formatarDinheiro(r.custos.fixos),
            formatarDinheiro(r.custos.variaveis),
          )}
        />
        <Indicador
          rotulo={t.resumo.margem}
          valor={r.margem === null ? vazio : formatarPercentagem(r.margem)}
        />
        <Indicador
          rotulo={t.resumo.lucroEstimado}
          valor={formatarDinheiro(r.lucroEstimado)}
          alerta={r.lucroEstimado < 0}
        />
        <Indicador
          rotulo={t.resumo.lucroCaixa}
          valor={formatarDinheiro(r.lucroCaixa)}
          alerta={r.lucroCaixa < 0}
        />
        <Indicador
          rotulo={t.resumo.arpu}
          valor={r.arpu === null ? vazio : formatarDinheiro(r.arpu)}
        />
        <Indicador
          rotulo={t.resumo.atraso}
          valor={formatarDinheiro(r.atraso.comIva)}
          detalhe={t.resumo.atrasoDetalhe(r.atraso.n)}
          alerta={r.atraso.n > 0}
        />
      </div>
      <p className="text-sm text-muted-foreground">{t.resumo.lucrosAjuda}</p>
      <p className="text-sm">
        {t.resumo.saidas}:{" "}
        {r.saidas === null ? t.resumo.saidasPoucas : formatarPercentagem(r.saidas)}
      </p>
      <Secao id="grafico" titulo={t.resumo.grafico}>
        <div className="cartao grid gap-2 rounded-2xl p-4">
          <GraficoFinancas meses={serie} series={t.resumo.series} descricao={t.resumo.grafico} />
          <p className="text-xs text-muted-foreground">{t.resumo.graficoAjuda}</p>
        </div>
      </Secao>
      <Secao id="planos" titulo={t.resumo.planos}>
        <p className="flex gap-4 text-sm">
          <span>{t.resumo.plano(textos.admin.planos.basic, planos.basic)}</span>
          <span>{t.resumo.plano(textos.admin.planos.pro, planos.pro)}</span>
        </p>
      </Secao>
      <Secao id="equilibrio" titulo={t.equilibrio.titulo}>
        <div className="grid gap-4">
          <PontoEquilibrio
            fixos={r.custos.fixos}
            variavelPorBarbearia={r.ativas ? Math.round(r.custos.variaveis / r.ativas) : 0}
            valorMedio={valorMedio(r.arpu, percentBasic ?? 50, regime)}
            ativas={r.ativas}
            percentBasic={percentBasic}
            regime={regime}
            mesPrevisto={previsto ? mesPorExtenso(previsto) : null}
          />
          {percentBasic !== null ? (
            <form className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1.5">
                <span className="rotulo">{t.equilibrio.escolherMistura}</span>
                <input
                  type="number"
                  name="basic"
                  min={0}
                  max={100}
                  defaultValue={percentBasic}
                  className="h-11 w-28 rounded-lg border border-input bg-card px-3 text-sm"
                />
              </label>
              <Button type="submit" variant="outline" className="h-11">
                {t.equilibrio.aplicar}
              </Button>
            </form>
          ) : null}
        </div>
      </Secao>
    </div>
  );
}
