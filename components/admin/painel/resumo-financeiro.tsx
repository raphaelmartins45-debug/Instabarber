import { Indicador } from "@/components/nucleo/indicador";
import type { Resumo } from "@/lib/financas/indicadores";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarPercentagem } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import { BlocoPainel } from "./resumo-painel";

const t = textos.admin.painel;

/** O financeiro do painel geral (D-212): receita, recebido, custos, lucro, clientes e equilíbrio. */
export function ResumoFinanceiro({
  mrr,
  fin,
  ativas,
  adesoesMes,
  contratosMes,
  equilibrio,
}: {
  mrr: { comIva: number; semIva: number };
  fin: Resumo;
  ativas: number;
  adesoesMes: number;
  contratosMes: number;
  equilibrio: number | null;
}) {
  return (
    <BlocoPainel id="financeiro" titulo={t.financeiro} href="/admin/financas">
      <Indicador
        rotulo={t.receita}
        valor={formatarDinheiro(mrr.comIva)}
        detalhe={t.semIva(formatarDinheiro(mrr.semIva))}
      />
      <Indicador rotulo={t.faturado} valor={formatarDinheiro(fin.recebido)} />
      <Indicador
        rotulo={t.custosMes}
        valor={formatarDinheiro(fin.custos.total)}
        detalhe={t.fixosVariaveis(
          formatarDinheiro(fin.custos.fixos),
          formatarDinheiro(fin.custos.variaveis),
        )}
      />
      <Indicador
        rotulo={t.lucro}
        valor={formatarDinheiro(fin.lucroEstimado)}
        detalhe={fin.margem === null ? undefined : t.margem(formatarPercentagem(fin.margem))}
        alerta={fin.lucroEstimado < 0}
      />
      <Indicador rotulo={t.ativas} valor={String(ativas)} detalhe={t.adesoesNoMes(adesoesMes)} />
      <Indicador rotulo={t.contratosMes} valor={String(contratosMes)} />
      <Indicador
        rotulo={t.equilibrio}
        valor={equilibrio === null ? "—" : t.barbeariasN(equilibrio)}
        detalhe={
          equilibrio === null ? t.equilibrioSem : t.equilibrioDetalhe(equilibrio - fin.ativas)
        }
      />
      <Indicador
        rotulo={t.emAtraso}
        valor={formatarDinheiro(fin.atraso.comIva)}
        detalhe={t.emAtrasoDetalhe(fin.atraso.n)}
        alerta={fin.atraso.n > 0}
      />
    </BlocoPainel>
  );
}
