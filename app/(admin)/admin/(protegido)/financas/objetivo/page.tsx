import { FormularioMeta } from "@/components/admin/financas/formulario-meta";
import { Previsao } from "@/components/admin/financas/previsao";
import { BarraProgresso } from "@/components/nucleo/barra-progresso";
import { Secao } from "@/components/nucleo/secao";
import { resumoDoMes, valorDoPlano, valorMedio } from "@/lib/financas/indicadores";
import { previsaoPorOmissao } from "@/lib/financas/previsao-base";
import { mesAnterior, mesAtual, mesPorExtenso, nomeDoMes } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarPercentagem } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { metaEmVigor, quantasFaltam, taxaConversao } from "@/lib/regras/previsao";
import { listarPropostas } from "@/lib/repositorios/comercial/propostas";
import {
  barbeariasParaFinancas,
  listarContas,
  listarCustos,
  listarMetas,
  recebimentosDesde,
} from "@/lib/repositorios/financas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.financas;
export const metadata = { title: `${t.separadores.objetivo} · ${t.titulo}` };

/** Objetivo de faturação e «quantas barbearias faltam» (O.7) e previsões a 12 meses (O.8). */
export default async function ObjetivoEPrevisoes() {
  const regime = lerRegimeIva(process.env.PRESTADORA_REGIME_IVA);
  const mes = mesAtual();
  const bd = await criarClienteServidor();
  const [barbearias, custos, contas, recebimentos, metas, propostas] = await Promise.all([
    barbeariasParaFinancas(bd),
    listarCustos(bd),
    listarContas(bd),
    recebimentosDesde(bd, `${mes}-01`),
    listarMetas(bd),
    listarPropostas(bd),
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
  const meta = metaEmVigor(metas, mes);
  const atual = meta?.base === "recebido" ? r.recebido : r.mrr;
  const falta = meta ? meta.valorCent - atual : 0;
  const medio = valorMedio(r.arpu, 50, regime);
  const estados = propostas.map((p) => p.estado_efetivo);
  const abertas = estados.filter((e) => e === "enviada").length;
  const taxa = taxaConversao(
    estados.filter((e) => e === "aceite").length,
    estados.filter((e) => e === "recusada").length,
  );
  const base = previsaoPorOmissao(barbearias, custos, mes, r.saidas);
  const respostas = [
    {
      id: "basic",
      rotulo: t.objetivo.soBasic,
      n: quantasFaltam(falta, valorDoPlano("basic", regime)),
    },
    { id: "pro", rotulo: t.objetivo.soPro, n: quantasFaltam(falta, valorDoPlano("pro", regime)) },
    { id: "mistura", rotulo: t.objetivo.mistura, n: quantasFaltam(falta, medio) },
  ];
  return (
    <div className="grid gap-6">
      <Secao id="meta" titulo={t.objetivo.meta}>
        <div className="grid gap-4">
          <p className="font-semibold" data-testid="meta-atual">
            {meta
              ? t.objetivo.metaDe(
                  formatarDinheiro(meta.valorCent),
                  t.objetivo.bases[meta.base]!,
                  mesPorExtenso(meta.mes.slice(0, 7)),
                )
              : t.objetivo.semMeta}
          </p>
          {meta ? (
            <div className="cartao grid gap-2 rounded-2xl p-4" data-testid="meta-falta">
              <span className="rotulo">{t.objetivo.falta}</span>
              <span className="numero text-2xl font-bold">
                {falta > 0 ? formatarDinheiro(falta) : t.objetivo.atingido}
              </span>
              <BarraProgresso
                percentagem={(atual / meta.valorCent) * 100}
                rotulo={t.objetivo.falta}
              />
              <span className="text-sm text-muted-foreground">
                {t.objetivo.cumprido(formatarPercentagem(Math.min(1, atual / meta.valorCent)))}
              </span>
            </div>
          ) : null}
          <details className="cartao rounded-2xl p-4">
            <summary className="cursor-pointer font-semibold">{t.objetivo.definir}</summary>
            <div className="pt-4">
              <FormularioMeta mes={mes} />
            </div>
          </details>
        </div>
      </Secao>
      {meta && falta > 0 ? (
        <Secao id="quantas" titulo={t.objetivo.quantas}>
          <div className="grid gap-4">
            <ul className="grid gap-3 md:grid-cols-3">
              {respostas.map((q) => (
                <li
                  key={q.id}
                  className="cartao grid gap-1 rounded-2xl p-4"
                  data-testid={`faltam-${q.id}`}
                >
                  <span className="rotulo">{q.rotulo}</span>
                  <span className="numero text-2xl font-bold">
                    {q.n === null ? t.resumo.semValor : t.objetivo.barbearias(q.n)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="text-sm">
              <p className="font-semibold">{t.objetivo.caminho}</p>
              <p>{t.objetivo.abertas(abertas)}</p>
              <p className="text-muted-foreground">
                {taxa === null
                  ? t.objetivo.semTaxa
                  : t.objetivo.previstas(Math.round(abertas * taxa), formatarPercentagem(taxa))}
              </p>
            </div>
          </div>
        </Secao>
      ) : null}
      <Secao id="previsao" titulo={t.previsao.titulo}>
        <Previsao
          mrrInicial={r.mrr}
          meses={base.meses.map((m) => ({
            mes: m,
            rotulo: nomeDoMes(m).slice(0, 3),
            extenso: mesPorExtenso(m),
          }))}
          custos={base.custos}
          novas={base.novas}
          saidas={base.saidas}
          declarada={base.declarada}
          valorMedio={medio}
          metaCent={meta?.valorCent ?? null}
          valorPro={valorDoPlano("pro", regime)}
          custosMes={r.custos.total}
        />
      </Secao>
    </div>
  );
}
