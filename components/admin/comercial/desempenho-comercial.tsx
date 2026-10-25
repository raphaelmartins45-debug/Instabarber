import { Indicador } from "@/components/nucleo/indicador";
import { type Desempenho, type MetaComercial, progressoMeta } from "@/lib/comercial/desempenho";
import { formatarPercentagem } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.desempenho;

/** Um número do mês contra a meta: «3 de 4» e a percentagem. */
function ContraMeta({ rotulo, feito, meta }: { rotulo: string; feito: number; meta?: number }) {
  const p = meta ? progressoMeta(feito, meta) : null;
  return (
    <Indicador
      rotulo={rotulo}
      valor={meta ? t.meta(feito, meta) : String(feito)}
      detalhe={p === null ? t.semMeta : t.progresso(p)}
    />
  );
}

/** Os números do mês do comercial contra as metas, e a conversão (D-161). */
export function DesempenhoComercial({
  d,
  meta,
}: {
  d: Desempenho;
  meta: MetaComercial | undefined;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3" data-testid="desempenho">
      <ContraMeta rotulo={t.leadsNovos} feito={d.leadsNovos} meta={meta?.leadsNovos} />
      <ContraMeta rotulo={t.propostas} feito={d.propostas} meta={meta?.propostas} />
      <ContraMeta rotulo={t.ganhos} feito={d.ganhos} meta={meta?.ganhos} />
      <Indicador rotulo={t.abertos} valor={String(d.abertos)} />
      <Indicador
        rotulo={t.conversao}
        valor={d.conversao === null ? textos.comum.vazio : formatarPercentagem(d.conversao)}
        detalhe={d.conversao === null ? t.conversaoPoucos : undefined}
      />
    </div>
  );
}
