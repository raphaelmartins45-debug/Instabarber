import { notFound } from "next/navigation";
import { PainelProfissional } from "@/components/barbearia/painel-profissional";
import { BarraProgresso } from "@/components/nucleo/barra-progresso";
import { ChamadaUpgrade } from "@/components/nucleo/chamada-upgrade";
import { Indicador } from "@/components/nucleo/indicador";
import { Secao } from "@/components/nucleo/secao";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import {
  hojeIso,
  mesAnterior,
  mesAtual,
  mesPorExtenso,
  primeiroDoMes,
} from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { abrirAreaProfissional } from "@/lib/painel/area-profissional";
import { intervaloDoMes } from "@/lib/painel/calendario";
import { indicadoresDia } from "@/lib/painel/indicadores";
import { faturacaoServicos } from "@/lib/regras/financeiro";
import { listarObjetivosDesde } from "@/lib/repositorios/painel/objetivos";
import { listarVisitas } from "@/lib/repositorios/painel/visitas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

const t = textos.profissional.metas;
export const metadata = { title: `${t.titulo} · ${vertical.camadas.equipa}` };

type LinhaHistorico = { mes: string; objetivoCent: number; faturadoCent: number };

/**
 * Metas do barbeiro (E.3, F.3): objetivo mensal definido pelo gestor, barra de progresso, valor
 * necessário por dia e os últimos seis meses (Pro). No Basic, a chamada de upgrade.
 */
export default async function MetasProfissional({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = await abrirAreaProfissional(id);
  const inq = area.contexto.barbearia.id;
  const ativa = area.grelha.ativas.has("metas_profissional");
  if (!ativa && !area.grelha.comUpgrade.has("metas_profissional")) notFound();
  if (!ativa) {
    return (
      <PainelProfissional area={area} atual="metas">
        <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
        <ChamadaUpgrade />
      </PainelProfissional>
    );
  }
  const mes = mesAtual();
  const desde = mesAnterior(mes, 5);
  const bd = await criarClienteServidor();
  const [indicadores, objetivos, visitas] = await Promise.all([
    indicadoresDia(bd, inq, id),
    listarObjetivosDesde(bd, inq, id, primeiroDoMes(desde)),
    listarVisitas(bd, inq, { de: intervaloDoMes(desde).de, profissionalId: id }),
  ]);
  const p = indicadores.progresso;
  const historico: LinhaHistorico[] = [0, 1, 2, 3, 4, 5].map((n) => {
    const m = mesAnterior(mes, n);
    return {
      mes: m,
      objetivoCent: objetivos.find((o) => o.mes === primeiroDoMes(m))?.valorCent ?? 0,
      faturadoCent: faturacaoServicos(
        visitas.filter((v) => hojeIso(new Date(v.data)).startsWith(m)),
      ),
    };
  });

  return (
    <PainelProfissional area={area} atual="metas">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      {p.objetivoCent === 0 ? (
        <p className="text-sm text-muted-foreground">{t.semObjetivo}</p>
      ) : (
        <div className="grid gap-3 rounded-xl border bg-card p-4">
          <div className="grid grid-cols-3 gap-3">
            <Indicador rotulo={t.objetivo} valor={formatarDinheiro(p.objetivoCent)} />
            <Indicador rotulo={t.faturado} valor={formatarDinheiro(p.faturadoCent)} />
            <Indicador rotulo={t.falta} valor={formatarDinheiro(p.emFaltaCent)} />
          </div>
          <BarraProgresso percentagem={p.percentagem} rotulo={textos.profissional.progresso} />
          {p.emFaltaCent > 0 && p.diasRestantes > 0 ? (
            <p className="text-sm">
              {t.porDia(formatarDinheiro(p.necessarioPorDiaCent), p.diasRestantes)}
            </p>
          ) : null}
        </div>
      )}
      <Secao id="historico" titulo={t.historico}>
        <TabelaCartoes<LinhaHistorico>
          linhas={historico}
          chave={(l) => l.mes}
          vazio={textos.comum.vazio}
          colunas={[
            { id: "mes", rotulo: t.colunas.mes, valor: (l) => mesPorExtenso(l.mes) },
            {
              id: "objetivo",
              rotulo: t.colunas.objetivo,
              valor: (l) =>
                l.objetivoCent ? formatarDinheiro(l.objetivoCent) : textos.comum.vazio,
            },
            {
              id: "faturado",
              rotulo: t.colunas.faturado,
              valor: (l) => formatarDinheiro(l.faturadoCent),
            },
            {
              id: "percentagem",
              rotulo: t.colunas.percentagem,
              valor: (l) =>
                l.objetivoCent
                  ? `${Math.round((l.faturadoCent / l.objetivoCent) * 100)} %`
                  : textos.comum.vazio,
            },
          ]}
        />
      </Secao>
    </PainelProfissional>
  );
}
