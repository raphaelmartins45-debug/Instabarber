import { Indicador } from "@/components/nucleo/indicador";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import type { ResumoMes as Resumo } from "@/lib/regras/financeiro";

const t = textos.financeiro.resumo;

/** Resumo do mês (E.2): faturação, receita, custos, despesas, comissões, resultado e margem. */
export function ResumoMes({ r }: { r: Resumo }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="resumo-mes">
      <Indicador rotulo={t.faturacao} valor={formatarDinheiro(r.faturacaoCent)} />
      <Indicador
        rotulo={t.receita}
        valor={formatarDinheiro(r.receitaCent)}
        detalhe={t.receitaAjuda}
      />
      <Indicador rotulo={t.custos} valor={formatarDinheiro(r.custosCent)} />
      <Indicador rotulo={t.despesas} valor={formatarDinheiro(r.despesasCent)} />
      <Indicador rotulo={t.comissoes} valor={formatarDinheiro(r.comissoesCent)} />
      <Indicador
        rotulo={t.resultado}
        valor={formatarDinheiro(r.resultadoCent)}
        alerta={r.resultadoCent < 0}
      />
      <Indicador
        rotulo={t.margem}
        valor={r.margem === null ? textos.comum.vazio : `${formatarNumero(r.margem)} %`}
      />
    </div>
  );
}
