import { Indicador } from "@/components/nucleo/indicador";
import { Secao } from "@/components/nucleo/secao";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta, mesPorExtenso } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { LinhaAcertoProfissional } from "@/lib/painel/acertos";
import type { RegistoAcerto } from "@/lib/repositorios/painel/acertos";

const t = textos.profissional.acerto;

/** Folha de acerto do barbeiro: o mês em curso e os acertos registados pelo gestor (só leitura). */
export function FolhaAcerto({
  mes,
  linha,
  historico,
}: {
  mes: string;
  linha: LinhaAcertoProfissional | null;
  historico: RegistoAcerto[];
}) {
  return (
    <div className="grid gap-4">
      {linha ? (
        <Secao id="mes" titulo={t.mes(mesPorExtenso(mes))}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="folha-acerto">
            <Indicador
              rotulo={t.modelo}
              valor={textos.sistema.equipa.modelos[linha.modelo] ?? linha.modelo}
            />
            <Indicador rotulo={t.servicos} valor={String(linha.servicos)} />
            <Indicador rotulo={t.receita} valor={formatarDinheiro(linha.receitaCent)} />
            <Indicador
              rotulo={linha.sentido === "a_pagar" ? t.aReceber : t.aEntregar}
              valor={formatarDinheiro(linha.acertoCent)}
            />
            <Indicador rotulo={t.liquidado} valor={formatarDinheiro(linha.liquidadoCent)} />
            <Indicador rotulo={t.porLiquidar} valor={formatarDinheiro(linha.porLiquidarCent)} />
          </div>
        </Secao>
      ) : null}
      <Secao id="historico" titulo={t.historico}>
        <TabelaCartoes<RegistoAcerto>
          linhas={historico}
          chave={(r) => r.id}
          vazio={t.semRegistos}
          colunas={[
            {
              id: "mes",
              rotulo: textos.financeiro.acertos.colunas.mes,
              valor: (r) => mesPorExtenso(r.mes.slice(0, 7)),
            },
            {
              id: "data",
              rotulo: textos.financeiro.acertos.colunas.data,
              valor: (r) => (r.liquidadoEm ? dataCurta(r.liquidadoEm) : textos.comum.vazio),
            },
            {
              id: "sentido",
              rotulo: textos.financeiro.acertos.colunas.sentido,
              valor: (r) => textos.financeiro.acertos.sentidos[r.sentido],
            },
            {
              id: "valor",
              rotulo: textos.financeiro.acertos.colunas.valor,
              valor: (r) => formatarDinheiro(r.valorCent),
            },
            {
              id: "metodo",
              rotulo: textos.financeiro.acertos.colunas.metodo,
              valor: (r) =>
                r.metodo ? (textos.sistema.metodos[r.metodo] ?? r.metodo) : textos.comum.vazio,
            },
          ]}
        />
      </Secao>
      <p className="text-sm text-muted-foreground">{t.nota}</p>
    </div>
  );
}
