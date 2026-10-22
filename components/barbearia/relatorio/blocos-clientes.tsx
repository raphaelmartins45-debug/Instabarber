import { ChamadaUpgrade } from "@/components/nucleo/chamada-upgrade";
import { Indicador } from "@/components/nucleo/indicador";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { RelatorioMes } from "@/lib/painel/relatorio-tipos";
import { BlocoRelatorio } from "./bloco";

const t = textos.relatorio;

/**
 * Blocos 5 e 6: retenção, com a caixa «O sistema pagou-se sozinho» (no Basic, os que voltaram
 * sozinhos e a chamada de upgrade), e fidelização.
 */
export function BlocosClientes({ r, mensagens }: { r: RelatorioMes; mensagens: boolean }) {
  const x = r.retencao;
  const f = r.fidelizacao;
  return (
    <>
      <BlocoRelatorio n={5} titulo={t.blocos.retencao}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Indicador rotulo={t.retencao.recuperados} valor={String(x.recuperados)} />
          <Indicador rotulo={t.retencao.ligacoes} valor={String(x.ligacoesAbertas)} />
          <Indicador rotulo={t.retencao.novos} valor={String(x.novos)} />
          <Indicador rotulo={t.retencao.ativos} valor={String(x.ativos)} />
          <Indicador rotulo={t.retencao.emRisco} valor={String(x.emRisco)} />
        </div>
        {mensagens ? (
          <aside
            className="grid gap-1 rounded-xl border border-sucesso/40 bg-sucesso/5 p-4 text-sm"
            data-testid="pagou-se-sozinho"
          >
            <p className="font-bold">{t.retencao.pagouTitulo}</p>
            <p>{t.retencao.recuperou(formatarDinheiro(x.recuperadaCent))}</p>
            <p>{t.retencao.custou(formatarDinheiro(x.subscricaoCent))}</p>
          </aside>
        ) : (
          <div className="grid gap-2">
            <p className="text-sm">{t.retencao.sozinhos(x.voltaramSozinhos)}</p>
            <ChamadaUpgrade />
          </div>
        )}
      </BlocoRelatorio>
      <BlocoRelatorio n={6} titulo={t.blocos.fidelizacao}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Indicador rotulo={t.fidelizacao.selos} valor={String(f.selosAtribuidos)} />
          <Indicador rotulo={t.fidelizacao.cartoes} valor={String(f.cartoesCompletos)} />
          <Indicador rotulo={t.fidelizacao.premios} valor={String(f.premiosResgatados)} />
          <Indicador rotulo={t.fidelizacao.convites} valor={String(f.convites)} />
        </div>
      </BlocoRelatorio>
    </>
  );
}
