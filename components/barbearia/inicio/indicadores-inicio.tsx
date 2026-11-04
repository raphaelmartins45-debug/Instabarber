import { BarraObjetivo } from "@/components/nucleo/barra-objetivo";
import { Indicador } from "@/components/nucleo/indicador";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { IndicadoresDia } from "@/lib/painel/indicadores";

const t = textos.inicio.kpi;

/**
 * Os quatro indicadores do Início (E.2, D-203): o dia contra o esperado, o mês contra o objetivo
 * (com a marca de onde se devia estar hoje), as marcações de hoje e o ticket médio do mês.
 */
export function IndicadoresInicio({
  i,
  marcacoesHoje,
  porFazer,
}: {
  i: IndicadoresDia;
  marcacoesHoje: number;
  porFazer: number;
}) {
  const p = i.progresso;
  const esperadoHoje = i.faturadoHojeCent + i.previsaoCent;
  const pctHoje = esperadoHoje ? Math.round((i.faturadoHojeCent / esperadoHoje) * 100) : 0;
  const decorridos = i.diasFuncionamento.filter((d) => d <= i.hoje).length;
  const esperadoMes = i.diasFuncionamento.length
    ? Math.round((decorridos / i.diasFuncionamento.length) * 100)
    : 0;
  const visitas = i.visitasMes.length;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="indicadores">
      <Indicador
        rotulo={t.hoje}
        valor={formatarDinheiro(i.faturadoHojeCent)}
        detalhe={t.dePrevistos(formatarDinheiro(esperadoHoje), i.servicosHoje)}
      >
        <BarraObjetivo valor={pctHoje} rotulo={t.progressoHoje(pctHoje)} />
      </Indicador>
      <Indicador
        rotulo={t.mes}
        valor={formatarDinheiro(i.faturadoMesCent)}
        detalhe={p.objetivoCent ? t.objetivo(formatarDinheiro(p.objetivoCent)) : t.semObjetivo}
      >
        {p.objetivoCent ? (
          <BarraObjetivo
            valor={p.percentagem}
            marca={esperadoMes}
            rotulo={t.progressoMes(p.percentagem, esperadoMes)}
          />
        ) : null}
      </Indicador>
      <Indicador
        rotulo={t.marcacoes}
        valor={String(marcacoesHoje)}
        detalhe={t.porFazer(porFazer)}
      />
      <Indicador
        rotulo={t.ticket}
        valor={formatarDinheiro(visitas ? Math.round(i.faturadoMesCent / visitas) : 0)}
        detalhe={t.visitas(visitas)}
      />
    </div>
  );
}
