import { Indicador } from "@/components/nucleo/indicador";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import type { RelatorioMes } from "@/lib/painel/relatorio-tipos";
import { nomeDia, percentagem, textoRecomendacao } from "@/lib/painel/relatorio-textos";
import { BlocoRelatorio } from "./bloco";

const t = textos.relatorio;

function Linha({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b py-2 text-sm last:border-0">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className={forte ? "font-bold tabular-nums" : "tabular-nums"}>{valor}</dd>
    </div>
  );
}

/** Blocos 7 a 9: financeiro (só o gestor), operação e as recomendações (F.5). */
export function BlocosGestao({ r }: { r: RelatorioMes }) {
  const f = r.financeiro;
  const o = r.operacao;
  const d = formatarDinheiro;
  const n = (b: number) => (r.financeiro ? b : b - 1);
  return (
    <>
      {f ? (
        <BlocoRelatorio n={7} titulo={t.blocos.financeiro}>
          <dl className="rounded-xl border bg-card px-4">
            <Linha rotulo={t.financeiro.receitaPropria} valor={d(f.receitaPropriaCent)} />
            <Linha rotulo={t.financeiro.rendas} valor={d(f.rendasCent)} />
            <Linha rotulo={t.financeiro.parteCasa} valor={d(f.parteCasaCent)} />
            <Linha rotulo={t.financeiro.comissoes} valor={d(f.comissoesCent)} />
            {f.clube ? (
              <>
                <Linha rotulo={t.financeiro.mensalidades} valor={d(f.clube.mensalidadesCent)} />
                <Linha rotulo={t.financeiro.subscritores} valor={String(f.clube.subscritores)} />
                <Linha rotulo={t.financeiro.creditos} valor={String(f.clube.creditosPorUsar)} />
              </>
            ) : null}
            {f.loja ? (
              <>
                <Linha rotulo={t.financeiro.lojaReceita} valor={d(f.loja.receitaSemIvaCent)} />
                <Linha rotulo={t.financeiro.lojaCusto} valor={d(f.loja.custoCent)} />
                <Linha rotulo={t.financeiro.lojaMargem} valor={d(f.loja.margemCent)} />
                <Linha rotulo={t.financeiro.abaixoMinimo} valor={String(f.loja.abaixoMinimo)} />
              </>
            ) : null}
            <Linha rotulo={t.financeiro.receita} valor={d(f.receitaCent)} forte />
            <Linha rotulo={t.financeiro.custos} valor={d(f.custosCent)} />
            <Linha rotulo={t.financeiro.despesas} valor={d(f.despesasCent)} />
            <Linha rotulo={t.financeiro.resultado} valor={d(f.resultadoCent)} forte />
            <Linha rotulo={t.financeiro.margem} valor={percentagem(f.margem)} />
          </dl>
        </BlocoRelatorio>
      ) : null}
      <BlocoRelatorio n={n(8)} titulo={t.blocos.operacao}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Indicador rotulo={t.operacao.faltas} valor={percentagem(o.taxaFaltas)} />
          <Indicador rotulo={t.operacao.ocupacao} valor={percentagem(o.ocupacao)} />
          <Indicador rotulo={t.operacao.melhorDia} valor={nomeDia(o.melhorDia)} />
          <Indicador rotulo={t.operacao.piorDia} valor={nomeDia(o.piorDia)} />
          <Indicador
            rotulo={t.operacao.antecedencia}
            valor={
              o.antecedencia === null ? t.vazio : t.operacao.dias(formatarNumero(o.antecedencia))
            }
          />
        </div>
      </BlocoRelatorio>
      <BlocoRelatorio n={n(9)} titulo={t.blocos.recomendacoes}>
        {r.recomendacoes.length ? (
          <ol className="grid list-decimal gap-2 pl-5 text-sm" data-testid="recomendacoes">
            {r.recomendacoes.map((x) => (
              <li key={x.tipo}>{textoRecomendacao(x)}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">{t.recomendacoes.vazio}</p>
        )}
      </BlocoRelatorio>
    </>
  );
}
