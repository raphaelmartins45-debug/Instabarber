import { BotaoAcao } from "@/components/admin/financas/botao-acao";
import { FormularioConta } from "@/components/admin/financas/formulario-conta";
import { FormularioCusto } from "@/components/admin/financas/formulario-custo";
import { GerarContas } from "@/components/admin/financas/gerar-contas";
import { ListaContas } from "@/components/admin/financas/lista-contas";
import { ListaCustos } from "@/components/admin/financas/lista-custos";
import { Secao } from "@/components/nucleo/secao";
import { custosDoMes } from "@/lib/financas/custos";
import { mesAtual } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { listarContas, listarCustos } from "@/lib/repositorios/financas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { carregarCustosDePartida } from "../acoes";

const t = textos.financas;
export const metadata = { title: `${t.separadores.custos} · ${t.titulo}` };

/** Custos e contas a pagar (O.4). */
export default async function CustosEContas({
  searchParams,
}: {
  searchParams: Promise<{ contas?: string }>;
}) {
  const { contas: filtro = "abertas" } = await searchParams;
  const bd = await criarClienteServidor();
  const [custos, contas] = await Promise.all([listarCustos(bd), listarContas(bd)]);
  const mes = custosDoMes(custos, mesAtual());
  const visiveis = filtro === "todas" ? contas : contas.filter((c) => c.estado !== "paga");
  return (
    <div className="grid gap-6">
      <Secao id="custos" titulo={t.custos.titulo}>
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">{t.custos.ajuda}</p>
          <p className="font-semibold" data-testid="custos-mes">
            {t.custos.totalMes(formatarDinheiro(mes.fixos), formatarDinheiro(mes.variaveis))}
          </p>
          {!custos.length ? (
            <div className="cartao grid gap-2 rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">{t.custos.partidaAjuda}</p>
              <BotaoAcao rotulo={t.custos.partida} acao={carregarCustosDePartida} />
            </div>
          ) : null}
          <ListaCustos custos={custos} />
          <details className="cartao rounded-2xl p-4">
            <summary className="cursor-pointer font-semibold">{t.custos.novo}</summary>
            <div className="pt-4">
              <FormularioCusto />
            </div>
          </details>
        </div>
      </Secao>
      <Secao id="contas" titulo={t.contas.titulo}>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex gap-2">
              {Object.entries(t.contas.filtros).map(([v, r]) => (
                <a
                  key={v}
                  href={`?contas=${v}#contas`}
                  aria-current={v === filtro ? "page" : undefined}
                  className={
                    v === filtro
                      ? "rounded-full border border-primary bg-accent px-3 py-1.5 text-sm font-semibold"
                      : "rounded-full border px-3 py-1.5 text-sm text-muted-foreground"
                  }
                >
                  {r}
                </a>
              ))}
            </nav>
            <GerarContas />
          </div>
          <ListaContas contas={visiveis} />
          <details className="cartao rounded-2xl p-4">
            <summary className="cursor-pointer font-semibold">{t.contas.nova}</summary>
            <div className="pt-4">
              <FormularioConta />
            </div>
          </details>
        </div>
      </Secao>
    </div>
  );
}
