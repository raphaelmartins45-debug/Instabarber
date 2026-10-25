import { mesAnterior } from "@/lib/formatacao/datas";
import { textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { type RegimeIva } from "@/lib/regras/mensalidade";
import { precoDaBarbearia } from "@/lib/regras/receita";
import { metaEmVigor } from "@/lib/regras/previsao";
import { comIvaCent, type Custo, custoDaConta } from "./custos";
import { type BarbeariaFin, semIvaDoRecebido, serieMensal } from "./indicadores";

// Exportação para o contabilista (O.10): por mês, trimestre ou ano, com os valores sem e com
// IVA em colunas separadas e «Não é documento fiscal» no topo. Uma só montagem para CSV e PDF.

const t = textos.financas.exportar;

export type TipoPeriodo = "mes" | "trimestre" | "ano";

/** Os meses do período que contém o mês de referência («AAAA-MM»). */
export function mesesDoPeriodo(tipo: TipoPeriodo, referencia: string): string[] {
  const [ano, mes] = referencia.split("-").map(Number) as [number, number];
  const primeiro =
    tipo === "mes" ? mes : tipo === "trimestre" ? Math.floor((mes - 1) / 3) * 3 + 1 : 1;
  const n = tipo === "mes" ? 1 : tipo === "trimestre" ? 3 : 12;
  const inicio = `${ano}-${String(primeiro).padStart(2, "0")}`;
  return Array.from({ length: n }, (_, i) => mesAnterior(inicio, -i));
}

export type DadosExportacao = {
  tipo: TipoPeriodo;
  meses: string[];
  regime: RegimeIva;
  barbearias: (BarbeariaFin & { nome: string })[];
  recebimentos: { valorCent: number; data: string; barbearia: string }[];
  custos: Custo[];
  contas: {
    fornecedor: string;
    vencimento: string;
    pagoEm: string | null;
    semIvaCent: number;
    comIvaCent: number;
  }[];
  metas: { mes: string; valorCent: number; base: string }[];
};

const euros = textoDeCentimos;
const noPeriodo = (data: string | null, meses: string[]) =>
  !!data && meses.includes(data.slice(0, 7));

/** As secções do ficheiro, iguais no CSV e no PDF. */
export function seccoesDaExportacao(d: DadosExportacao) {
  const c = t.colunas;
  const serie = serieMensal(d.meses, d.barbearias, d.custos, d.regime);
  const recebidos = d.recebimentos.filter((r) => noPeriodo(r.data, d.meses));
  const contas = d.contas.filter(
    (x) => noPeriodo(x.vencimento, d.meses) || noPeriodo(x.pagoEm, d.meses),
  );
  const recebidoSem = (m: string) =>
    recebidos
      .filter((r) => r.data.startsWith(m))
      .reduce((s, r) => s + semIvaDoRecebido(r.valorCent, d.regime), 0);
  const pagas = (m: string) =>
    contas
      .filter((x) => x.pagoEm?.startsWith(m))
      .reduce((s, x) => s + custoDaConta(x, d.regime), 0);
  return [
    {
      titulo: t.seccoes.resumo,
      linhas: serie.map((m) => ({
        [c.mes]: m.mes,
        [c.receita]: euros(m.receita),
        [c.custos]: euros(m.custos),
        [c.lucroEstimado]: euros(m.lucro),
        [c.recebido]: euros(recebidoSem(m.mes)),
        [c.lucroCaixa]: euros(recebidoSem(m.mes) - pagas(m.mes)),
      })),
    },
    {
      titulo: t.seccoes.recebimentos,
      linhas: recebidos.map((r) => ({
        [c.data]: r.data,
        [c.barbearia]: r.barbearia,
        [c.semIva]: euros(semIvaDoRecebido(r.valorCent, d.regime)),
        [c.comIva]: euros(r.valorCent),
      })),
    },
    {
      titulo: t.seccoes.custos,
      linhas: d.custos
        .filter((x) =>
          d.meses.some(
            (m) => x.dataInicio.slice(0, 7) <= m && (!x.dataFim || x.dataFim.slice(0, 7) >= m),
          ),
        )
        .map((x) => ({
          [c.descricao]: x.descricao,
          [c.categoria]: textos.financas.categorias[x.categoria],
          [c.tipo]: textos.financas.tipos[x.tipo],
          [c.periodicidade]: textos.financas.periodicidades[x.periodicidade],
          [c.semIva]: euros(x.valorSemIvaCent),
          [c.comIva]: euros(comIvaCent(x.valorSemIvaCent)),
        })),
    },
    {
      titulo: t.seccoes.contas,
      linhas: contas.map((x) => ({
        [c.fornecedor]: x.fornecedor,
        [c.vencimento]: x.vencimento,
        [c.pagaEm]: x.pagoEm ?? "",
        [c.semIva]: euros(x.semIvaCent),
        [c.comIva]: euros(x.comIvaCent),
      })),
    },
    {
      titulo: t.seccoes.barbearias,
      linhas: d.barbearias
        .filter((b) => b.estado === "ativo")
        .map((b) => {
          const p = precoDaBarbearia(b, d.regime);
          return {
            [c.barbearia]: b.nome,
            [c.plano]: b.plano,
            [c.periodicidade]: b.periodicidade,
            [c.profissionais]: b.profissionais_contratados,
            [c.semIva]: euros(p.semIva),
            [c.comIva]: euros(p.comIva),
          };
        }),
    },
    {
      titulo: t.seccoes.objetivo,
      linhas: serie.flatMap((m) => {
        const meta = metaEmVigor(d.metas, m.mes);
        if (!meta) return [];
        const atual = meta.base === "recebido" ? recebidoSem(m.mes) : m.receita;
        return [
          {
            [c.mes]: m.mes,
            [c.objetivo]: euros(meta.valorCent),
            [c.base]: textos.financas.objetivo.bases[meta.base] ?? meta.base,
            [c.cumprimento]: `${Math.round((atual / meta.valorCent) * 100)} %`,
          },
        ];
      }),
    },
  ];
}

/** As linhas de cabeçalho: o que é o ficheiro, o período e o aviso fiscal. */
export const cabecalhoDaExportacao = (meses: string[]) => [
  t.titulo,
  t.periodo(meses[0]!, meses.at(-1)!),
  t.naoFiscal,
  t.valores,
];
