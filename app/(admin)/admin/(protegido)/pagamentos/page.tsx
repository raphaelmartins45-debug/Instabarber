import { FormularioPagamento } from "@/components/admin/formulario-pagamento";
import { Indicador } from "@/components/admin/indicador";
import { ListasPagamentos } from "@/components/admin/listas-pagamentos";
import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta, hojeIso } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { lerRegimeIva, type Periodicidade, type Plano } from "@/lib/regras/mensalidade";
import { precoDaBarbearia, receitaMensal } from "@/lib/regras/receita";
import { listarBarbearias, type LinhaBarbearia } from "@/lib/repositorios/admin/barbearias";
import { listarFaturas, listarRecebimentos } from "@/lib/repositorios/admin/pagamentos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.pagamentos;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/** Indicadores, barbearias, faturas da Performa LAB e recebimentos (E.1). Sem cobrança automática. */
export default async function Pagamentos() {
  const bd = await criarClienteServidor();
  const hoje = hojeIso();
  const inicioMes = `${hoje.slice(0, 8)}01`;
  const [barbearias, faturas, recebimentos] = await Promise.all([
    listarBarbearias(bd),
    listarFaturas(bd),
    listarRecebimentos(bd),
  ]);
  const regime = lerRegimeIva(process.env.PRESTADORA_REGIME_IVA);
  const ativas = barbearias.filter((b) => b.estado === "ativo");
  const atraso = ativas.filter((b) => b.estado_pagamento === "em_atraso");
  const mrr = receitaMensal(barbearias, regime);
  const nomes = new Map(barbearias.map((b) => [b.id, b.nome]));
  const opcoes = ativas.map((b) => ({ id: b.id, rotulo: b.nome }));
  const opcaoFaturas = faturas.map((f) => ({
    id: f.id,
    rotulo: f.numero,
    inquilinoId: f.inquilino_id,
  }));
  return (
    <section className="grid gap-6">
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Indicador
          rotulo={t.receitaMes}
          valor={formatarDinheiro(
            recebimentos
              .filter((r) => r.data >= inicioMes)
              .reduce((s, r) => s + r.valor_centimos, 0),
          )}
        />
        <Indicador rotulo={t.emDia} valor={String(ativas.length - atraso.length)} />
        <Indicador rotulo={t.emAtraso} valor={String(atraso.length)} alerta={atraso.length > 0} />
        <Indicador
          rotulo={t.valorAtraso}
          valor={formatarDinheiro(receitaMensal(atraso, regime).comIva)}
          alerta={atraso.length > 0}
        />
        <Indicador rotulo={t.projecao} valor={formatarDinheiro(mrr.comIva * 12)} />
      </div>
      <section className="grid gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.tabela}</h2>
        <TabelaCartoes<LinhaBarbearia>
          linhas={barbearias}
          chave={(b) => b.id}
          vazio={t.vazio}
          colunas={[
            { id: "barbearia", rotulo: t.colunas.barbearia, valor: (b) => b.nome },
            {
              id: "plano",
              rotulo: t.colunas.plano,
              valor: (b) => textos.admin.planos[b.plano as Plano],
            },
            {
              id: "periodicidade",
              rotulo: t.colunas.periodicidade,
              valor: (b) => textos.admin.periodicidades[b.periodicidade as Periodicidade],
            },
            {
              id: "estado",
              rotulo: t.colunas.estado,
              valor: (b) => textos.admin.estadosPagamento[b.estado_pagamento as "em_dia"],
            },
            {
              id: "vencimento",
              rotulo: t.colunas.vencimento,
              valor: (b) =>
                b.proximo_vencimento ? dataCurta(b.proximo_vencimento) : textos.comum.vazio,
            },
            {
              id: "valor",
              rotulo: t.colunas.valor,
              valor: (b) => formatarDinheiro(precoDaBarbearia(b, regime).comIva),
            },
          ]}
        />
      </section>
      <ListasPagamentos faturas={faturas} recebimentos={recebimentos} nomes={nomes} />
      {opcoes.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <FormularioPagamento
            tipo="fatura"
            barbearias={opcoes}
            faturas={opcaoFaturas}
            hoje={hoje}
          />
          <FormularioPagamento
            tipo="recebimento"
            barbearias={opcoes}
            faturas={opcaoFaturas}
            hoje={hoje}
          />
        </div>
      ) : null}
    </section>
  );
}
