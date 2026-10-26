import { ListaAlertas } from "@/components/admin/painel/lista-alertas";
import { Indicador } from "@/components/nucleo/indicador";
import { ApagarAuditoria } from "@/components/admin/apagar-auditoria";
import { ComprovativosPendentes } from "@/components/admin/painel/comprovativos-pendentes";
import { PedidosPendentes } from "@/components/admin/painel/pedidos-pendentes";
import { SeparadorAuditoria } from "@/components/admin/separadores/separador-auditoria";
import { periodoDe } from "@/lib/admin/comprovativos";
import { saude } from "@/lib/admin/saude";
import { alertasContas } from "@/lib/financas/custos";
import { dataCurta, hojeIso, somarDias } from "@/lib/formatacao/datas";
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
import { listarContas } from "@/lib/repositorios/financas";
import { listarPedidos } from "@/lib/repositorios/pedidos-adesao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const t = textos.admin.painel;
export const metadata = { title: `${t.titulo} · ${textos.marca.nome}` };

/**
 * Painel geral (E.1): quatro indicadores, pedidos pendentes, comprovativos por confirmar (D-168),
 * alertas e atividade recente.
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
      <h1 className="text-[22px] font-extrabold">{t.titulo}</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador
          rotulo={t.ativas}
          valor={String(barbearias.filter((b) => b.estado === "ativo").length)}
        />
        <Indicador
          rotulo={t.receita}
          valor={formatarDinheiro(mrr.comIva)}
          detalhe={t.semIva(formatarDinheiro(mrr.semIva))}
        />
        <Indicador rotulo={t.adesoesMes} valor={String(adesoesMes)} />
        <Indicador
          rotulo={t.pendentes}
          valor={String(pendentes.length)}
          alerta={pendentes.length > 0}
        />
      </div>
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
      <section className="grid gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.atividade}</h2>
        <SeparadorAuditoria limite={10} />
        <ApagarAuditoria />
      </section>
    </section>
  );
}
