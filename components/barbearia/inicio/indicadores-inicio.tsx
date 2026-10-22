import { Indicador } from "@/components/nucleo/indicador";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { IndicadoresDia } from "@/lib/painel/indicadores";

const t = textos.inicio.indicadores;

/** Os quatro indicadores do Início (E.2): faturado hoje, previsão, mês e falta para o objetivo. */
export function IndicadoresInicio({ i }: { i: IndicadoresDia }) {
  const p = i.progresso;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="indicadores">
      <Indicador
        rotulo={t.faturadoHoje}
        valor={formatarDinheiro(i.faturadoHojeCent)}
        detalhe={t.servicos(i.servicosHoje)}
      />
      <Indicador
        rotulo={t.previsao}
        valor={formatarDinheiro(i.previsaoCent)}
        detalhe={t.previsaoAjuda}
      />
      <Indicador
        rotulo={t.faturadoMes}
        valor={formatarDinheiro(i.faturadoMesCent)}
        detalhe={p.objetivoCent ? t.percentagemObjetivo(p.percentagem) : undefined}
      />
      <Indicador
        rotulo={t.faltaObjetivo}
        valor={p.objetivoCent ? formatarDinheiro(p.emFaltaCent) : textos.comum.vazio}
        detalhe={p.objetivoCent ? t.diasRestantes(p.diasRestantes) : t.semObjetivo}
      />
    </div>
  );
}
