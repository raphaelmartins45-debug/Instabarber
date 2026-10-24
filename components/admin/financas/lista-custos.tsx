import { Etiqueta } from "@/components/nucleo/etiqueta";
import { type Coluna, TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { equivalenteMensalCent } from "@/lib/financas/custos";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { CustoLinha } from "@/lib/repositorios/financas";
import { apagarUmCusto, terminar } from "@/app/(admin)/admin/(protegido)/financas/acoes";
import { BotaoAcao } from "./botao-acao";
import { FormularioCusto } from "./formulario-custo";

const t = textos.financas;
const data = (d: string | null) => (d ? dataCurta(`${d}T12:00:00Z`) : textos.comum.vazio);

/** Lista de custos (O.4) com o equivalente mensal, editar, dar fim e apagar. */
export function ListaCustos({ custos }: { custos: CustoLinha[] }) {
  const colunas: Coluna<CustoLinha>[] = [
    {
      id: "descricao",
      rotulo: t.custos.colunas.descricao,
      valor: (c) => (
        <span className="grid gap-1">
          <span className="font-semibold">{c.descricao}</span>
          {!c.ativo || c.dataFim ? <Etiqueta>{t.custos.inativo}</Etiqueta> : null}
        </span>
      ),
    },
    {
      id: "categoria",
      rotulo: t.custos.colunas.categoria,
      valor: (c) => t.categorias[c.categoria],
    },
    { id: "tipo", rotulo: t.custos.colunas.tipo, valor: (c) => t.tipos[c.tipo] },
    {
      id: "valor",
      rotulo: t.custos.colunas.valor,
      valor: (c) => (
        <span className="grid">
          <span>
            {formatarDinheiro(c.valorSemIvaCent)} · {t.periodicidades[c.periodicidade]}
          </span>
          {c.periodicidade === "anual" ? (
            <span className="text-xs text-muted-foreground">
              {t.custos.mensalEquivalente(formatarDinheiro(equivalenteMensalCent(c)))}
            </span>
          ) : null}
        </span>
      ),
    },
    { id: "inicio", rotulo: t.custos.colunas.inicio, valor: (c) => data(c.dataInicio) },
    { id: "fim", rotulo: t.custos.colunas.fim, valor: (c) => data(c.dataFim) },
    {
      id: "acoes",
      rotulo: "",
      valor: (c) => (
        <div className="flex flex-wrap items-start gap-2">
          <details className="w-full">
            <summary className="cursor-pointer text-sm text-ligacao underline">
              {t.custos.editar}
            </summary>
            <div className="pt-3">
              <FormularioCusto
                id={c.id}
                inicial={{
                  descricao: c.descricao,
                  categoria: c.categoria,
                  tipo: c.tipo,
                  valor_sem_iva: textoDeCentimos(c.valorSemIvaCent),
                  periodicidade: c.periodicidade,
                  data_inicio: c.dataInicio,
                  data_fim: c.dataFim ?? "",
                  nota: c.nota,
                }}
              />
            </div>
          </details>
          {c.ativo && !c.dataFim ? (
            <BotaoAcao
              rotulo={t.custos.terminar}
              acao={terminar.bind(null, c.id)}
              variante="ghost"
            />
          ) : null}
          <BotaoAcao
            rotulo={t.custos.apagar}
            acao={apagarUmCusto.bind(null, c.id)}
            confirmar={{ titulo: t.custos.apagarTitulo, texto: t.custos.apagarTexto }}
            variante="ghost"
          />
        </div>
      ),
    },
  ];
  return (
    <TabelaCartoes
      colunas={colunas}
      linhas={custos}
      chave={(c) => c.id}
      vazio={t.custos.vazio}
      testId="custo"
    />
  );
}
