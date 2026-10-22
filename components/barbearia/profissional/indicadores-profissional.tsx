import { Indicador } from "@/components/nucleo/indicador";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { IndicadoresDia } from "@/lib/painel/indicadores";

const t = textos.profissional.indicadores;

/**
 * Indicadores de um barbeiro (E.2 Equipa e E.3): faturado hoje, previsão, mês e falta para o
 * objetivo do dia; na área do próprio, também o ticket médio e a taxa de regresso.
 */
export function IndicadoresProfissional({
  i,
  metas,
  extra,
}: {
  i: IndicadoresDia;
  /** `metas_profissional` ativo: percentagem do objetivo e falta para o dia. */
  metas: boolean;
  extra?: { ticketCent: number; regresso: number | null };
}) {
  const p = i.progresso;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="indicadores-profissional">
      <Indicador
        rotulo={t.faturadoHoje}
        valor={formatarDinheiro(i.faturadoHojeCent)}
        detalhe={textos.inicio.indicadores.servicos(i.servicosHoje)}
      />
      <Indicador rotulo={t.previsao} valor={formatarDinheiro(i.previsaoCent)} />
      <Indicador
        rotulo={t.faturadoMes}
        valor={formatarDinheiro(i.faturadoMesCent)}
        detalhe={
          metas && p.objetivoCent
            ? textos.inicio.indicadores.percentagemObjetivo(p.percentagem)
            : undefined
        }
      />
      {metas ? (
        <Indicador
          rotulo={t.faltaDia}
          valor={p.objetivoCent ? formatarDinheiro(i.faltaHojeCent) : textos.comum.vazio}
        />
      ) : null}
      {extra ? (
        <>
          <Indicador rotulo={t.ticket} valor={formatarDinheiro(extra.ticketCent)} />
          <Indicador
            rotulo={t.regresso}
            valor={extra.regresso === null ? textos.comum.vazio : `${extra.regresso} %`}
            detalhe={t.regressoAjuda}
          />
        </>
      ) : null}
    </div>
  );
}
