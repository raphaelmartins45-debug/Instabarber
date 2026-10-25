import { AgendaDia } from "@/components/admin/comercial/agenda-dia";
import { CarteiraRisco } from "@/components/admin/comercial/carteira-risco";
import { DesempenhoComercial } from "@/components/admin/comercial/desempenho-comercial";
import { DesempenhoEquipa } from "@/components/admin/comercial/desempenho-equipa";
import { FormularioMetaComercial } from "@/components/admin/comercial/formulario-meta-comercial";
import { ListaComissoes } from "@/components/admin/comercial/lista-comissoes";
import { SeletorMes } from "@/components/admin/comercial/seletor-mes";
import { Secao } from "@/components/nucleo/secao";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { saude } from "@/lib/admin/saude";
import { agendaDoDia } from "@/lib/comercial/agenda";
import { resumoComissoes } from "@/lib/comercial/comissoes";
import { desempenhoDoMes } from "@/lib/comercial/desempenho";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { hojeIso, mesAtual, mesPorExtenso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { listarComerciais } from "@/lib/repositorios/admin/equipa";
import { saudeCarteira } from "@/lib/repositorios/comercial/carteira";
import { listarComissoes } from "@/lib/repositorios/comercial/comissoes";
import {
  carteiraComercial,
  dadosDesempenho,
  metasDoMes,
} from "@/lib/repositorios/comercial/desempenho";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.comercial.desempenho;
const tc = textos.comercial.comissoes;
export const metadata = { title: `${t.titulo} · ${textos.comercial.titulo}` };

/**
 * Desempenho comercial (D-161, D-162). O comercial vê o dia (agenda), o mês contra as metas, a
 * carteira com o risco de cada barbearia e as comissões, como o barbeiro vê o seu painel; o dono
 * e o gestor veem a equipa, definem as metas e registam as comissões.
 */
export default async function DesempenhoPagina({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes: pedido } = await searchParams;
  const mes = pedido && /^\d{4}-\d{2}$/.test(pedido) ? pedido : mesAtual();
  const hoje = hojeIso();
  const quem = await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const [dados, metas, comissoes] = await Promise.all([
    dadosDesempenho(bd),
    metasDoMes(bd, mes),
    listarComissoes(bd),
  ]);
  const calcular = (userId: string) =>
    desempenhoDoMes(userId, mes, dados.leads, dados.propostas, dados.contratos);

  if (!eAdministrador(quem.papel)) {
    const carteira = (await saudeCarteira(bd)).map((b) => ({ ...b, ...saude(b, hoje) }));
    const r = resumoComissoes(comissoes, hoje);
    return (
      <div className="grid gap-6">
        <Secao id="hoje" titulo={textos.comercial.agenda.titulo}>
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">{textos.comercial.agenda.ajuda}</p>
            <AgendaDia
              itens={agendaDoDia(
                dados.leads,
                dados.propostas,
                carteira.filter((b) => b.nivel === "risco"),
                hoje,
              )}
            />
          </div>
        </Secao>
        <div className="grid gap-3">
          <h2 className="text-lg font-bold">
            {t.meuTitulo} · {mesPorExtenso(mes)}
          </h2>
          <p className="text-sm text-muted-foreground">{t.ajuda}</p>
          <SeletorMes mes={mes} />
          <DesempenhoComercial d={calcular(quem.userId)} meta={metas.get(quem.userId)} />
        </div>
        <Secao id="carteira" titulo={textos.comercial.carteiraRisco.titulo}>
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">{textos.comercial.carteiraRisco.ajuda}</p>
            <CarteiraRisco linhas={carteira} />
          </div>
        </Secao>
        {comissoes.length ? (
          <Secao id="comissoes" titulo={tc.titulo}>
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">{tc.ajuda}</p>
              <p className="font-semibold">
                {tc.resumo(formatarDinheiro(r.pendente), formatarDinheiro(r.a_pagar + r.vencida))}
              </p>
              <ListaComissoes comissoes={comissoes} hoje={hoje} nomes={null} />
            </div>
          </Secao>
        ) : null}
      </div>
    );
  }

  const comerciais = await listarComerciais(bd);
  const carteiras = await Promise.all(comerciais.map((c) => carteiraComercial(bd, c.userId)));
  const nomes = new Map(comerciais.map((c) => [c.userId, c.nome]));
  const aReceber = (userId: string) => {
    const r = resumoComissoes(
      comissoes.filter((c) => c.comercialId === userId),
      hoje,
    );
    return r.a_pagar + r.vencida + r.pendente;
  };
  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-bold">
        {t.titulo} · {mesPorExtenso(mes)}
      </h2>
      <p className="text-sm text-muted-foreground">{t.ajudaEquipa}</p>
      <SeletorMes mes={mes} />
      <DesempenhoEquipa
        comissoesVisiveis={comissoes.length > 0}
        linhas={comerciais.map((c, i) => ({
          userId: c.userId,
          nome: c.nome,
          d: calcular(c.userId),
          meta: metas.get(c.userId),
          carteira: carteiras[i]!.length,
          aReceberCent: aReceber(c.userId),
        }))}
      />
      {comerciais.length ? (
        <Secao id="metas" titulo={t.metas}>
          <FormularioMetaComercial
            mes={mes}
            comerciais={Object.fromEntries(comerciais.map((c) => [c.userId, c.nome]))}
          />
        </Secao>
      ) : null}
      {comerciais.length || comissoes.length ? (
        <Secao id="comissoes" titulo={tc.titulo}>
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">{tc.ajudaAdmin}</p>
            <ListaComissoes comissoes={comissoes} hoje={hoje} nomes={nomes} />
          </div>
        </Secao>
      ) : null}
    </div>
  );
}
