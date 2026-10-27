import { BibliotecaMensagens } from "@/components/admin/vendas/biblioteca-mensagens";
import { CalculadoraPerdas } from "@/components/admin/vendas/calculadora-perdas";
import { GuiaoVisita } from "@/components/admin/vendas/guiao-visita";
import { Objecoes } from "@/components/admin/vendas/objecoes";
import { SimuladorPreco } from "@/components/admin/vendas/simulador-preco";
import { CartaoDemonstracao } from "@/components/admin/comercial/cartao-demonstracao";
import { Secao } from "@/components/nucleo/secao";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { paginaPublica } from "@/lib/inquilino/endereco";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { obterDemonstracao } from "@/lib/repositorios/admin/demonstracao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.vendas;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/**
 * Apoio às vendas (D-181), na pasta «Gestão do negócio» e no menu do comercial: a demonstração
 * (só administradores, porque abre na vista de apoio) e as ferramentas da conversa e da visita.
 */
export default async function ApoioAsVendas() {
  const admin = eAdministrador((await exigirEquipaPlataforma()).papel);
  const demo = admin ? await obterDemonstracao(await criarClienteServidor()) : null;
  const regime = lerRegimeIva(process.env.PRESTADORA_REGIME_IVA);
  return (
    <section className="grid gap-8">
      <header className="grid gap-1">
        <h1 className="text-[22px] font-extrabold tracking-tight">{t.titulo}</h1>
        <p className="text-sm text-muted-foreground">{t.ajuda}</p>
      </header>
      {admin ? (
        <CartaoDemonstracao pagina={demo ? await paginaPublica(demo.slug) : null} />
      ) : (
        <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          {t.demonstracaoSoAdmin}
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-2">
        <Secao id="simulador" titulo={t.simulador.titulo}>
          <SimuladorPreco regime={regime} />
        </Secao>
        <Secao id="perdas" titulo={t.perdas.titulo}>
          <CalculadoraPerdas regime={regime} />
        </Secao>
        <Secao id="objecoes" titulo={t.objecoes.titulo}>
          <Objecoes />
        </Secao>
        <Secao id="mensagens" titulo={t.mensagens.titulo}>
          <BibliotecaMensagens />
        </Secao>
      </div>
      <Secao id="guiao" titulo={t.guiao.titulo}>
        <GuiaoVisita />
      </Secao>
    </section>
  );
}
