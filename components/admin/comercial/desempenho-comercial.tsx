import { Indicador } from "@/components/nucleo/indicador";
import { Secao } from "@/components/nucleo/secao";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { type Desempenho, type MetaComercial, progressoMeta } from "@/lib/comercial/desempenho";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarPercentagem } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import type { BarbeariaCarteira } from "@/lib/repositorios/comercial/desempenho";

const t = textos.comercial.desempenho;
const a = textos.admin;

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

/** O painel do comercial (D-161): números do mês, metas, conversão, comissão e carteira. */
export function DesempenhoComercial({
  d,
  meta,
  comissaoVisivel,
  carteira,
}: {
  d: Desempenho;
  meta: MetaComercial | undefined;
  comissaoVisivel: boolean;
  carteira: BarbeariaCarteira[];
}) {
  const colunas: Coluna<BarbeariaCarteira>[] = [
    { id: "nome", rotulo: t.colunas.barbearia, valor: (b) => b.nome },
    { id: "plano", rotulo: t.colunas.plano, valor: (b) => a.planos[b.plano as "pro"] ?? b.plano },
    {
      id: "estado",
      rotulo: t.colunas.estado,
      valor: (b) => a.estados[b.estado as "ativo"] ?? b.estado,
    },
    {
      id: "pagamento",
      rotulo: t.colunas.pagamento,
      valor: (b) => a.estadosPagamento[b.estadoPagamento as "em_dia"] ?? b.estadoPagamento,
    },
  ];
  return (
    <div className="grid gap-6">
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
        {comissaoVisivel ? (
          <Indicador
            rotulo={t.comissao}
            valor={formatarDinheiro(d.comissaoCent)}
            detalhe={t.comissaoAjuda}
          />
        ) : null}
      </div>
      <Secao id="carteira" titulo={t.carteira}>
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">{t.carteiraAjuda}</p>
          <TabelaCartoes
            colunas={colunas}
            linhas={carteira}
            chave={(b) => b.inquilinoId}
            vazio={t.carteiraVazia}
            testId="carteira"
          />
        </div>
      </Secao>
    </div>
  );
}
