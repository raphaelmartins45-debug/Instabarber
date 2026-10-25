import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import type { Desempenho, MetaComercial } from "@/lib/comercial/desempenho";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";

const t = textos.comercial.desempenho;

export type LinhaEquipa = {
  userId: string;
  nome: string;
  d: Desempenho;
  meta: MetaComercial | undefined;
  carteira: number;
  aReceberCent: number;
};

const contra = (feito: number, meta?: number) => (meta ? t.meta(feito, meta) : String(feito));

/** O desempenho do mês de cada comercial, para o dono e o gestor (D-161). */
export function DesempenhoEquipa({
  linhas,
  comissoesVisiveis,
}: {
  linhas: LinhaEquipa[];
  comissoesVisiveis: boolean;
}) {
  const colunas: Coluna<LinhaEquipa>[] = [
    { id: "nome", rotulo: t.colunas.comercial, valor: (l) => l.nome },
    {
      id: "leads",
      rotulo: t.colunas.leadsNovos,
      valor: (l) => contra(l.d.leadsNovos, l.meta?.leadsNovos),
    },
    {
      id: "propostas",
      rotulo: t.colunas.propostas,
      valor: (l) => contra(l.d.propostas, l.meta?.propostas),
    },
    { id: "ganhos", rotulo: t.colunas.ganhos, valor: (l) => contra(l.d.ganhos, l.meta?.ganhos) },
    { id: "carteira", rotulo: t.colunas.carteira, valor: (l) => String(l.carteira) },
  ];
  if (comissoesVisiveis)
    colunas.push({
      id: "comissao",
      rotulo: t.colunas.comissao,
      valor: (l) => formatarDinheiro(l.aReceberCent),
    });
  return (
    <TabelaCartoes
      colunas={colunas}
      linhas={linhas}
      chave={(l) => l.userId}
      vazio={t.semComerciais}
      testId="desempenho-equipa"
    />
  );
}
