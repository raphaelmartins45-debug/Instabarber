import { DemosMarcadas } from "@/components/admin/comercial/demos-marcadas";
import { ResumoComercial } from "@/components/admin/painel/resumo-comercial";
import { ResumoFinanceiro } from "@/components/admin/painel/resumo-financeiro";
import { conversaoLeads } from "@/lib/admin/metricas";
import { pontoDeEquilibrio, resumoDoMes, valorMedio } from "@/lib/financas/indicadores";
import { colunaDoFunil } from "@/lib/regras/comercial";
import { ganhosPorLead } from "@/lib/repositorios/comercial/contratos";
import { ESTADOS_FUNIL } from "@/lib/validacao/comercial";
import { ComunicadosEquipa } from "@/components/admin/painel/comunicados-equipa";
import { ListaAlertas } from "@/components/admin/painel/lista-alertas";
import { ApagarAuditoria } from "@/components/admin/apagar-auditoria";
import { ComprovativosPendentes } from "@/components/admin/painel/comprovativos-pendentes";
import { PedidosPendentes } from "@/components/admin/painel/pedidos-pendentes";
import { SeparadorAuditoria } from "@/components/admin/separadores/separador-auditoria";
import { periodoDe } from "@/lib/admin/comprovativos";
import { saude } from "@/lib/admin/saude";
import { alertasContas } from "@/lib/financas/custos";
import { dataCurta, hojeIso, mesAnterior, mesAtual, somarDias } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { resumoComissoes } from "@/lib/comercial/comissoes";
import { contarAlertas, faltamFeriados } from "@/lib/regras/alertas-admin";
import { leadParado, propostaAExpirar } from "@/lib/regras/comercial";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { receitaMensal } from "@/lib/regras/receita";
import { apoioEmAberto } from "@/lib/repositorios/admin/apoio";
import { listarBarbearias } from "@/lib/repositorios/admin/barbearias";
import { dadosDeSaude } from "@/lib/repositorios/admin/saude";
import { listarComprovativos } from "@/lib/repositorios/comprovativos";
import { listarComissoes } from "@/lib/repositorios/comercial/comissoes";
import { listarLeads, validadesEnviadas } from "@/lib/repositorios/comercial/leads";
import { contarFeriadosNacionais, datasFeriadosNacionais } from "@/lib/repositorios/feriados";
import {
  barbeariasParaFinancas,
  listarContas,
  listarCustos,
  recebimentosDesde,
} from "@/lib/repositorios/financas";
import { listarPedidos } from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.painel;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/**
 * Painel geral (E.1, D-212): as demonstrações marcadas, o resumo financeiro e o comercial, pedidos
 * pendentes, comprovativos por confirmar (D-168), alertas e atividade recente.
 */
export default async function PainelGeral() {
  const bd = await criarClienteServidor();
  const hoje = hojeIso();
  const proximoAno = Number(hoje.slice(0, 4)) + 1;
  const [
    todas,
    pendentes,
    feriados,
    leads,
    validades,
    feriadosRecentes,
    contas,
    apoio,
    comissoes,
    dadosSaude,
    comprovativos,
    barbeariasFin,
    custos,
    recebimentos,
    ganhos,
  ] = await Promise.all([
    listarBarbearias(bd),
    listarPedidos(bd),
    contarFeriadosNacionais(bd, proximoAno),
    listarLeads(bd),
    validadesEnviadas(bd),
    datasFeriadosNacionais(bd, somarDias(hoje, -60), hoje),
    listarContas(bd),
    apoioEmAberto(bd),
    listarComissoes(bd),
    dadosDeSaude(bd),
    listarComprovativos(bd, { estado: "pendente" }),
    barbeariasParaFinancas(bd),
    listarCustos(bd),
    recebimentosDesde(bd, `${mesAtual()}-01`),
    ganhosPorLead(bd),
  ]);
  // A barbearia de demonstração não conta nas contas nem nos alertas (D-162).
  const barbearias = todas.filter((b) => !b.demonstracao);
  const vencidas = resumoComissoes(comissoes, hoje).vencidas;
  const contasAlerta = alertasContas(contas, somarDias(hoje, 7));
  const parados = leads.filter((l) =>
    leadParado(
      { estado: l.estado, criadoEm: hojeIso(new Date(l.criado_em)) },
      hoje,
      feriadosRecentes,
    ),
  ).length;
  const aExpirar = validades.filter((v) => propostaAExpirar(v, hoje)).length;
  const mrr = receitaMensal(barbearias, lerRegimeIva(process.env.PRESTADORA_REGIME_IVA));
  const adesoesMes = barbearias.filter(
    (b) => b.aprovado_em && hojeIso(new Date(b.aprovado_em)).slice(0, 7) === hoje.slice(0, 7),
  ).length;
  const a = contarAlertas(barbearias, hoje);
  // Sinais de abandono (M.2): as barbearias que a página Saúde dá em risco.
  const abandono = dadosSaude.filter((d) => saude(d, hoje).nivel === "risco").length;
  // O resumo de tudo (D-212): as mesmas fórmulas das Finanças (O.5, O.6) e das Métricas.
  const regime = lerRegimeIva(process.env.PRESTADORA_REGIME_IVA);
  const mes = mesAtual();
  const fin = resumoDoMes({
    barbearias: barbeariasFin,
    recebimentos,
    custos,
    contas,
    mes,
    mesAnterior: mesAnterior(mes),
    regime,
  });
  const equilibrio = pontoDeEquilibrio(
    fin.custos.fixos,
    valorMedio(fin.arpu, 50, regime),
    fin.ativas ? Math.round(fin.custos.variaveis / fin.ativas) : 0,
  );
  const contratosMes = [...ganhos.values()].filter(
    (g) => hojeIso(new Date(g.assinadoEm)).slice(0, 7) === mes,
  ).length;
  const conversao = conversaoLeads(
    leads.map((l) => ({ estado: l.estado, origem: l.origem, inquilinoId: l.inquilino_id })),
  );
  const etapas = ESTADOS_FUNIL.map((e) => ({
    id: e,
    rotulo: textos.comercial.estados[e] ?? e,
    n: leads.filter((l) => colunaDoFunil(l.estado, ganhos.get(l.id), hoje) === e).length,
  }));
  const demos = leads.filter(
    (l) =>
      l.estado === "demo_marcada" &&
      l.demo_em &&
      hojeIso(new Date(l.demo_em)) >= hoje &&
      hojeIso(new Date(l.demo_em)) <= somarDias(hoje, 7),
  );
  const demosHoje = demos.filter((l) => hojeIso(new Date(l.demo_em!)) === hoje).length;
  const alertas = [
    a.atraso ? { texto: t.atraso(a.atraso), href: "/admin/pagamentos" } : null,
    a.suspensas
      ? { texto: t.suspensas(a.suspensas), href: "/admin/barbearias?estado=suspenso" }
      : null,
    a.vencimentos
      ? { texto: t.vencimentos(a.vencimentos), href: "/admin/financas/vencimentos" }
      : null,
    abandono ? { texto: t.abandono(abandono), href: "/admin/saude" } : null,
    faltamFeriados(hoje, feriados) ? { texto: t.feriados(proximoAno), href: null } : null,
    parados
      ? { texto: textos.comercial.alertas.leadsParados(parados), href: "/admin/comercial" }
      : null,
    aExpirar
      ? { texto: textos.comercial.alertas.propostasAExpirar(aExpirar), href: "/admin/comercial" }
      : null,
    apoio.n
      ? {
          texto: textos.gestao.apoio.abertos(apoio.n),
          href:
            apoio.barbearias.length === 1
              ? `/admin/barbearias/${apoio.barbearias[0]}/apoio`
              : "/admin/barbearias",
        }
      : null,
    vencidas
      ? {
          texto: textos.comercial.comissoes.alertaVencidas(vencidas),
          href: "/admin/comercial/desempenho#comissoes",
        }
      : null,
    contasAlerta.atrasadas
      ? {
          texto: textos.financas.alertas.atrasadas(contasAlerta.atrasadas),
          href: "/admin/financas/custos#contas",
        }
      : null,
    contasAlerta.aVencer
      ? {
          texto: textos.financas.alertas.aVencer(contasAlerta.aVencer),
          href: "/admin/financas/custos#contas",
        }
      : null,
  ].filter((x) => x !== null);

  return (
    <section className="grid gap-6">
      <h1 className="text-titulo font-extrabold tracking-tight">{t.titulo}</h1>
      <ComunicadosEquipa />
      <DemosMarcadas leads={leads} />
      <ResumoFinanceiro
        mrr={mrr}
        fin={fin}
        ativas={barbearias.filter((b) => b.estado === "ativo").length}
        adesoesMes={adesoesMes}
        contratosMes={contratosMes}
        equilibrio={equilibrio}
      />
      <ResumoComercial
        conversao={conversao}
        parados={parados}
        demos={demos.length}
        demosHoje={demosHoje}
        risco={abandono}
        aExpirar={aExpirar}
        pendentes={pendentes.length}
        etapas={etapas}
      />
      <PedidosPendentes
        pedidos={pendentes.map((p) => ({
          id: p.id,
          nome: p.nome,
          detalhe: t.detalhePedido(
            textos.admin.planos[p.plano as "basic" | "pro"],
            p.profissionais,
            formatarDinheiro(centimosDeNumeric(p.mensalidade_calculada)),
            dataCurta(p.submetido_em),
          ),
        }))}
      />
      <ComprovativosPendentes
        linhas={comprovativos.map((c) => ({
          id: c.id,
          nome: todas.find((b) => b.id === c.inquilino_id)?.nome ?? textos.comum.vazio,
          detalhe: textos.comprovativos.admin.detalhe(
            formatarDinheiro(c.valor_centimos),
            textos.comprovativos.metodos[c.metodo] ?? c.metodo,
            periodoDe(c),
          ),
        }))}
      />
      <ListaAlertas alertas={alertas} />
      <section className="grid gap-2" aria-labelledby="painel-atividade">
        <h2 id="painel-atividade" className="text-secao font-bold">
          {t.atividade}
        </h2>
        <SeparadorAuditoria limite={10} />
        <div className="flex justify-end">
          <ApagarAuditoria />
        </div>
      </section>
    </section>
  );
}
