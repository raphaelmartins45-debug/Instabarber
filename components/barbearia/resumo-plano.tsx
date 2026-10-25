import { ListasPagamentos } from "@/components/admin/listas-pagamentos";
import { Indicador } from "@/components/nucleo/indicador";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { precoDaBarbearia } from "@/lib/regras/receita";
import type { Fatura, Recebimento } from "@/lib/repositorios/admin/pagamentos";
import type { ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";

const t = textos.plano;

/**
 * O plano, a mensalidade com a fórmula única (D.7), o vencimento e as faturas e recebimentos:
 * em «O meu plano» e, com a barbearia suspensa, na página do acesso suspenso (M.4).
 */
export function ResumoPlano({
  b,
  faturas,
  recebimentos,
}: {
  b: ConfiguracaoBarbearia;
  faturas: Fatura[];
  recebimentos: Recebimento[];
}) {
  const plano = b.plano as "basic" | "pro";
  const periodicidade = b.periodicidade as "mensal" | "anual";
  const preco = precoDaBarbearia(b, lerRegimeIva(process.env.PRESTADORA_REGIME_IVA));
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="meu-plano">
        <Indicador
          rotulo={t.plano}
          valor={t.planos[plano] ?? plano}
          detalhe={t.periodicidades[periodicidade]}
        />
        <Indicador rotulo={t.profissionais} valor={String(b.profissionais_contratados)} />
        <Indicador
          rotulo={t.mensalidade}
          valor={formatarDinheiro(preco.comIva)}
          detalhe={t.semIva(formatarDinheiro(preco.semIva))}
        />
        <Indicador
          rotulo={t.vencimento}
          valor={
            b.proximo_vencimento
              ? dataCurta(`${b.proximo_vencimento}T12:00:00Z`)
              : textos.comum.vazio
          }
        />
      </div>
      {b.dominio_proprio ? <p className="text-sm">{t.dominio(b.dominio_proprio)}</p> : null}
      <p className="text-sm">
        {t.mudar}{" "}
        <a
          href={`mailto:${textos.marca.apoio}`}
          className="font-semibold text-ligacao underline-offset-4 hover:underline"
        >
          {t.escrever}
        </a>
      </p>
      <ListasPagamentos faturas={faturas} recebimentos={recebimentos} />
    </>
  );
}
