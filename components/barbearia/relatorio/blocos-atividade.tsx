import { Indicador } from "@/components/nucleo/indicador";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { nomeDoMes } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { RelatorioMes } from "@/lib/painel/relatorio-tipos";
import { percentagem, textoVariacao } from "@/lib/painel/relatorio-textos";
import { BlocoRelatorio } from "./bloco";
import { GraficoEvolucao } from "./grafico-evolucao";

const t = textos.relatorio;

/** Blocos 1 a 4 do relatório: resumo, evolução, desempenho e serviços. */
export function BlocosAtividade({ r }: { r: RelatorioMes }) {
  const f = r.financeiro;
  return (
    <>
      <BlocoRelatorio n={1} titulo={t.blocos.resumo}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Indicador
            rotulo={t.resumo.faturacao}
            valor={formatarDinheiro(r.resumo.faturacaoCent)}
            detalhe={textoVariacao(r.resumo.variacao)}
          />
          {f ? (
            <Indicador
              rotulo={t.resumo.resultado}
              valor={formatarDinheiro(f.resultadoCent)}
              detalhe={`${t.resumo.margem}: ${percentagem(f.margem)}`}
            />
          ) : null}
          <Indicador rotulo={t.resumo.atendidos} valor={String(r.resumo.atendidos)} />
          <Indicador rotulo={t.resumo.perdidos} valor={String(r.resumo.perdidos)} />
          <Indicador rotulo={t.resumo.recuperados} valor={String(r.resumo.recuperados)} />
        </div>
      </BlocoRelatorio>
      <BlocoRelatorio n={2} titulo={t.blocos.evolucao}>
        <GraficoEvolucao
          atual={r.mes}
          descricao={r.evolucao
            .map((m) => `${nomeDoMes(m.mes)}: ${formatarDinheiro(m.faturacaoCent)}`)
            .join("; ")}
          meses={r.evolucao.map((m) => ({ ...m, rotulo: nomeDoMes(m.mes).slice(0, 3) }))}
        />
      </BlocoRelatorio>
      <BlocoRelatorio
        n={3}
        titulo={r.profissionalId ? t.blocos.meuDesempenho : t.blocos.desempenho}
      >
        <TabelaCartoes
          linhas={r.desempenho}
          chave={(l) => l.profissionalId}
          vazio={t.vazio}
          colunas={[
            { id: "nome", rotulo: t.colunas.profissional, valor: (l) => l.nome },
            {
              id: "fat",
              rotulo: t.colunas.faturacao,
              valor: (l) => formatarDinheiro(l.faturacaoCent),
            },
            { id: "serv", rotulo: t.colunas.servicos, valor: (l) => String(l.servicos) },
            {
              id: "ticket",
              rotulo: t.colunas.ticket,
              valor: (l) => formatarDinheiro(l.ticketCent),
            },
            {
              id: "obj",
              rotulo: t.colunas.objetivo,
              valor: (l) => percentagem(l.objetivoPercent),
            },
            {
              id: "com",
              rotulo: t.colunas.comissao,
              valor: (l) => formatarDinheiro(l.comissaoCent),
            },
          ]}
        />
      </BlocoRelatorio>
      <BlocoRelatorio n={4} titulo={t.blocos.servicos}>
        <TabelaCartoes
          linhas={r.servicos}
          chave={(l) => l.servicoId}
          vazio={t.vazio}
          colunas={[
            { id: "nome", rotulo: t.colunas.servico, valor: (l) => l.nome },
            { id: "q", rotulo: t.colunas.quantidade, valor: (l) => String(l.quantidade) },
            {
              id: "rec",
              rotulo: t.colunas.receita,
              valor: (l) => formatarDinheiro(l.receitaCent),
            },
            { id: "peso", rotulo: t.colunas.peso, valor: (l) => `${formatarNumero(l.peso)} %` },
          ]}
        />
      </BlocoRelatorio>
    </>
  );
}
