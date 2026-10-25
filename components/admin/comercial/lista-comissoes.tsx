import { Etiqueta } from "@/components/nucleo/etiqueta";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { estadoComissao } from "@/lib/comercial/comissoes";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { ComissaoLinha } from "@/lib/repositorios/comercial/comissoes";
import { AcoesComissao } from "./acoes-comissao";

const t = textos.comercial.comissoes;
const TOM = { pendente: "neutro", a_pagar: "info", vencida: "perda", paga: "sucesso" } as const;
const dia = (iso: string) => dataCurta(`${iso}T12:00:00Z`);

/**
 * As comissões (D-162). O comercial vê as suas; o dono e o gestor veem todas, com o nome do
 * comercial e os botões para registar a taxa paga e a comissão paga.
 */
export function ListaComissoes({
  comissoes,
  hoje,
  nomes,
}: {
  comissoes: ComissaoLinha[];
  hoje: string;
  nomes: Map<string, string> | null;
}) {
  const colunas: Coluna<ComissaoLinha>[] = [
    { id: "contrato", rotulo: t.colunas.contrato, valor: (c) => c.contrato },
    { id: "barbearia", rotulo: t.colunas.barbearia, valor: (c) => c.barbearia },
    {
      id: "valor",
      rotulo: t.colunas.valor,
      valor: (c) => formatarDinheiro(Math.round(c.valor * 100)),
    },
    {
      id: "estado",
      rotulo: t.colunas.estado,
      valor: (c) => {
        const e = estadoComissao(c, hoje);
        return <Etiqueta tom={TOM[e]}>{t.estados[e]}</Etiqueta>;
      },
    },
    {
      id: "prazo",
      rotulo: t.colunas.prazo,
      valor: (c) =>
        c.paga_em
          ? t.pagaEm(dia(c.paga_em))
          : c.vence_em
            ? t.vence(dia(c.vence_em))
            : textos.comum.vazio,
    },
  ];
  if (nomes) {
    colunas.splice(2, 0, {
      id: "comercial",
      rotulo: t.colunas.comercial,
      valor: (c) => (c.comercialId && nomes.get(c.comercialId)) || textos.comum.vazio,
    });
    colunas.push({
      id: "acoes",
      rotulo: t.colunas.acoes,
      valor: (c) =>
        c.estado === "paga" ? null : (
          <AcoesComissao id={c.id} passo={c.estado === "pendente" ? "taxa" : "paga"} hoje={hoje} />
        ),
    });
  }
  return (
    <TabelaCartoes
      colunas={colunas}
      linhas={comissoes}
      chave={(c) => c.id}
      vazio={t.vazio}
      testId="comissao"
    />
  );
}
