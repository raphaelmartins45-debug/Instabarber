import { Indicador } from "@/components/nucleo/indicador";
import { formatarPercentagem } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import { BlocoPainel, type Etapa, FunilResumo } from "./resumo-painel";

const t = textos.admin.painel;

/** O comercial do painel geral (D-212): leads, demos, conversão, risco e o funil. */
export function ResumoComercial({
  conversao,
  parados,
  demos,
  demosHoje,
  risco,
  aExpirar,
  pendentes,
  etapas,
}: {
  conversao: { ganhos: number; perdidos: number; abertos: number; taxa: number | null };
  parados: number;
  demos: number;
  demosHoje: number;
  risco: number;
  aExpirar: number;
  pendentes: number;
  etapas: Etapa[];
}) {
  return (
    <BlocoPainel id="comercial" titulo={t.comercial} href="/admin/comercial">
      <Indicador
        rotulo={t.leadsAbertos}
        valor={String(conversao.abertos)}
        detalhe={parados ? `${t.parados}: ${parados}` : undefined}
      />
      <Indicador rotulo={t.demosSemana} valor={String(demos)} detalhe={t.demosHoje(demosHoje)} />
      <Indicador
        rotulo={t.conversao}
        valor={conversao.taxa === null ? "—" : formatarPercentagem(conversao.taxa)}
        detalhe={
          conversao.taxa === null
            ? t.conversaoPoucos
            : t.conversaoDetalhe(conversao.ganhos, conversao.perdidos)
        }
      />
      <Indicador rotulo={t.risco} valor={String(risco)} alerta={risco > 0} />
      <Indicador rotulo={t.aExpirar} valor={String(aExpirar)} alerta={aExpirar > 0} />
      <Indicador rotulo={t.pendentes} valor={String(pendentes)} alerta={pendentes > 0} />
      <FunilResumo etapas={etapas} />
    </BlocoPainel>
  );
}
