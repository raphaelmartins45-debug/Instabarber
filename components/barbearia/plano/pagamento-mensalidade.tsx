import { Secao } from "@/components/nucleo/secao";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { periodoDe } from "@/lib/admin/comprovativos";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro, textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { DadosPagamento } from "@/lib/painel/pagamento";
import type { Comprovativo } from "@/lib/repositorios/comprovativos";
import { EnviarComprovativo } from "./enviar-comprovativo";

const t = textos.comprovativos;

/** Pagar a mensalidade (D-168): enviar o comprovativo e ver os já enviados, com o estado. */
export function PagamentoMensalidade({
  inquilinoId,
  dados,
  podeEnviar,
}: {
  inquilinoId: string;
  dados: DadosPagamento;
  podeEnviar: boolean;
}) {
  return (
    <Secao id="pagar" titulo={t.titulo}>
      <div className="grid gap-4">
        {dados.emAnalise ? (
          <p
            className="rounded-lg border bg-card px-3 py-2 text-sm"
            data-testid="comprovativo-em-analise"
          >
            {dados.emAnalise}
          </p>
        ) : podeEnviar ? (
          <EnviarComprovativo
            inquilinoId={inquilinoId}
            ajuda={dados.ajuda}
            valorInicial={textoDeCentimos(dados.valorCent)}
            hoje={dados.hoje}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{dados.ajuda}</p>
        )}
        <h3 className="text-sm font-bold">{t.historico}</h3>
        <TabelaCartoes<Comprovativo>
          linhas={dados.comprovativos}
          chave={(c) => c.id}
          vazio={t.vazio}
          testId="comprovativo"
          colunas={[
            { id: "enviado", rotulo: t.colunas.enviado, valor: (c) => dataCurta(c.enviado_em) },
            { id: "periodo", rotulo: t.colunas.periodo, valor: (c) => periodoDe(c) },
            {
              id: "valor",
              rotulo: t.colunas.valor,
              valor: (c) => formatarDinheiro(c.valor_centimos),
            },
            { id: "metodo", rotulo: t.colunas.metodo, valor: (c) => t.metodos[c.metodo] },
            {
              id: "estado",
              rotulo: t.colunas.estado,
              valor: (c) =>
                c.estado === "recusado" && c.motivo
                  ? t.recusadoPorque(c.motivo)
                  : t.estados[c.estado],
            },
          ]}
        />
      </div>
    </Secao>
  );
}
