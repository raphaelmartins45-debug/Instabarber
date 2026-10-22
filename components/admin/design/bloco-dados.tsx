import { AnelProgresso } from "@/components/nucleo/anel-progresso";
import { BarraProgresso } from "@/components/nucleo/barra-progresso";
import { Indicador } from "@/components/nucleo/indicador";
import { Secao } from "@/components/nucleo/secao";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { Etiqueta } from "@/components/nucleo/etiqueta";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.admin.design;
const estadosAcerto = textos.financeiro.acertos.estados;

type Linha = { id: string; nome: string; servicos: number; centimos: number; estado: string };

// Dados de demonstração, só para o catálogo.
const LINHAS: Linha[] = [
  { id: "1", nome: "Carlos", servicos: 42, centimos: 71400, estado: "a_pagar" },
  { id: "2", nome: "Rui", servicos: 31, centimos: 52700, estado: "a_receber" },
  { id: "3", nome: "Tiago", servicos: 18, centimos: 30600, estado: "liquidado" },
];

const TOM = { a_pagar: "alerta", a_receber: "info", liquidado: "sucesso" } as const;

const COLUNAS: Coluna<Linha>[] = [
  { id: "nome", rotulo: t.colunas.nome, valor: (l) => l.nome },
  { id: "servicos", rotulo: t.colunas.servicos, valor: (l) => formatarNumero(l.servicos) },
  { id: "faturado", rotulo: t.colunas.faturado, valor: (l) => formatarDinheiro(l.centimos) },
  {
    id: "estado",
    rotulo: t.colunas.estado,
    valor: (l) => (
      <Etiqueta tom={TOM[l.estado as keyof typeof TOM]}>{estadosAcerto[l.estado]}</Etiqueta>
    ),
  },
];

/** Indicadores, objetivos e tabela do catálogo. */
export function BlocoDados() {
  return (
    <>
      <Secao id="design-indicadores" titulo={t.indicadores}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Indicador
            rotulo={t.faturado}
            valor={formatarDinheiro(35600)}
            detalhe={t.faturadoDetalhe}
          />
          <Indicador
            rotulo={t.parado}
            valor={formatarDinheiro(29100)}
            detalhe={t.paradoDetalhe}
            alerta
          />
        </div>
      </Secao>
      <Secao id="design-objetivos" titulo={t.objetivos}>
        <div className="cartao flex flex-wrap items-center gap-8 rounded-2xl p-5">
          <AnelProgresso
            percentagem={78}
            centro={`${formatarNumero(78)} %`}
            legenda={t.falta}
            rotulo={t.objetivoMes}
          />
          <AnelProgresso
            percentagem={100}
            centro={`${formatarNumero(100)} %`}
            legenda={t.atingido}
            rotulo={t.objetivoDia}
            tom="sucesso"
            tamanho={96}
          />
          <div className="grid min-w-48 flex-1 gap-2">
            <span className="rotulo">{t.progresso}</span>
            <BarraProgresso percentagem={64} rotulo={t.progresso} />
          </div>
        </div>
      </Secao>
      <Secao id="design-tabela" titulo={t.tabela}>
        <TabelaCartoes
          colunas={COLUNAS}
          linhas={LINHAS}
          chave={(l) => l.id}
          vazio={t.vazioTitulo}
        />
      </Secao>
    </>
  );
}
