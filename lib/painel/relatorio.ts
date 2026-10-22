import "server-only";
import { hojeIso, mesAnterior, primeiroDoMes } from "@/lib/formatacao/datas";
import { ticketMedio } from "@/lib/regras/classificacao";
import { faturacaoServicos } from "@/lib/regras/financeiro";
import { calcularPrecoCent, lerRegimeIva } from "@/lib/regras/mensalidade";
import { receitaAdicionalEstimada, recomendacoes } from "@/lib/regras/recomendacoes";
import {
  antecedenciaMedia,
  combinacaoMaisProcurada,
  dentro,
  faturacaoPorDiaSemana,
  retencao,
  servicosDoPeriodo,
  taxaFaltas,
  variacaoPercent,
} from "@/lib/regras/relatorio";
import type { ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";
import { saldosSelos } from "@/lib/repositorios/painel/clientes";
import { listarObjetivos } from "@/lib/repositorios/painel/objetivos";
import {
  marcacoesDoPeriodo,
  movimentosSelos,
  recuperacoesAbertas,
} from "@/lib/repositorios/painel/relatorio";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { listarVisitasParaRadar } from "@/lib/repositorios/painel/visitas";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { acertosDoMes } from "./acertos";
import { intervaloDoMes } from "./calendario";
import { financeiroDoMes } from "./financeiro";
import { ocupacaoDoMes } from "./ocupacao-mes";
import { blocoFinanceiro } from "./relatorio-financeiro";
import type { RelatorioMes } from "./relatorio-tipos";

// O relatório mensal (E.5): um só motor para o gestor (a barbearia) e para o barbeiro (o que ele
// produziu). Os números vêm das mesmas funções do Início, do Financeiro e dos acertos.

const DIA_MS = 86_400_000;

export async function relatorioDoMes(
  bd: ClienteBD,
  b: ConfiguracaoBarbearia,
  mes: string,
  profissionalId: string | null,
  ativas: ReadonlySet<string>,
  agora: Date = new Date(),
): Promise<RelatorioMes> {
  const periodo = intervaloDoMes(mes);
  const anterior = intervaloDoMes(mesAnterior(mes));
  const seis = [5, 4, 3, 2, 1, 0].map((n) => mesAnterior(mes, n));
  const gestor = profissionalId === null;
  const [historico, servicos, marcacoes, mensagens, selos, saldos, acertos, objetivos, financeiro] =
    await Promise.all([
      listarVisitasParaRadar(bd, b.id, profissionalId),
      listarServicos(bd, b.id, false),
      marcacoesDoPeriodo(bd, b.id, periodo, profissionalId),
      recuperacoesAbertas(
        bd,
        b.id,
        { de: new Date(periodo.de.getTime() - 30 * DIA_MS), ate: periodo.ate },
        profissionalId,
      ),
      movimentosSelos(bd, b.id, periodo),
      saldosSelos(bd, b.id),
      acertosDoMes(bd, b.id, mes, profissionalId),
      listarObjetivos(bd, b.id, primeiroDoMes(mes)),
      gestor ? financeiroDoMes(bd, b.id, mes) : null,
    ]);
  const doMes = acertos.visitas;
  const faturacaoCent = faturacaoServicos(doMes);
  const anteriores = historico.filter((v) => dentro(v.data, anterior));
  const r = retencao(historico, periodo, mensagens, agora);
  const nome = new Map(servicos.map((s) => [s.id, s.nome]));
  const ocupacao = await ocupacaoDoMes(bd, b, mes, marcacoes, profissionalId);
  const porDia = faturacaoPorDiaSemana(doMes);
  const dias = [...porDia].sort((a, c) => c[1] - a[1]);
  const meusClientes = new Set(historico.map((v) => v.clienteId));
  const cartoesCompletos = [...saldos].filter(
    ([c, s]) => s >= b.selos_necessarios && (gestor || meusClientes.has(c)),
  ).length;
  const porMinuto = ocupacao.total.marcados > 0 ? faturacaoCent / ocupacao.total.marcados : 0;
  const combinacao = combinacaoMaisProcurada(doMes);
  const ticketCent = ticketMedio(doMes.map((v) => v.valorCobradoCent));
  return {
    mes,
    profissionalId,
    resumo: {
      faturacaoCent,
      variacao: variacaoPercent(faturacaoCent, faturacaoServicos(anteriores)),
      atendidos: r.atendidos,
      perdidos: r.perdidos,
      recuperados: r.recuperados,
    },
    evolucao: seis.map((m) => ({
      mes: m,
      faturacaoCent: faturacaoServicos(historico.filter((v) => dentro(v.data, intervaloDoMes(m)))),
    })),
    desempenho: acertos.linhas.map((l) => {
      const minhas = doMes.filter((v) => v.profissionalId === l.profissionalId);
      const objetivo = objetivos.find((o) => o.profissionalId === l.profissionalId)?.valorCent ?? 0;
      return {
        profissionalId: l.profissionalId,
        nome: l.nome,
        faturacaoCent: l.receitaCent,
        servicos: l.servicos,
        ticketCent: ticketMedio(minhas.map((v) => v.valorCobradoCent)),
        objetivoPercent: objetivo > 0 ? Math.round((l.receitaCent / objetivo) * 100) : null,
        comissaoCent: minhas.reduce((a, v) => a + v.comissaoCent, 0),
      };
    }),
    servicos: servicosDoPeriodo(doMes).map((s) => ({ ...s, nome: nome.get(s.servicoId) ?? "" })),
    retencao: {
      ...r,
      ligacoesAbertas: mensagens.filter((m) => dentro(m.abertaEm, periodo)).length,
      subscricaoCent: calcularPrecoCent(
        b.plano as "basic" | "pro",
        b.profissionais_contratados,
        "mensal",
        !!b.dominio_proprio,
        lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
      ).comIva,
    },
    fidelizacao: {
      selosAtribuidos: selos
        .filter((s) => s.tipo === "visita" || s.tipo === "convite")
        .reduce((a, s) => a + s.quantidade, 0),
      cartoesCompletos,
      premiosResgatados: selos.filter((s) => s.tipo === "resgate").length,
      convites: selos.filter((s) => s.tipo === "convite").length,
    },
    financeiro: financeiro
      ? await blocoFinanceiro(
          bd,
          b.id,
          financeiro,
          faturacaoServicos(doMes.filter((v) => v.modelo === "A")),
          periodo,
          hojeIso(agora),
          ativas,
        )
      : null,
    operacao: {
      taxaFaltas: taxaFaltas(marcacoes.map((m) => m.estado)),
      ocupacao: ocupacao.media,
      melhorDia: dias[0]?.[0] ?? null,
      piorDia: dias.length > 1 ? dias[dias.length - 1]![0] : null,
      antecedencia: antecedenciaMedia(marcacoes),
    },
    recomendacoes: recomendacoes({
      perdidos: r.perdidos,
      aRecuperarCent: r.aRecuperarCent,
      diasSemana: [...ocupacao.porDiaSemana].map(([diaSemana, m]) => ({
        diaSemana,
        ocupacao: Math.round((m.marcados / m.disponiveis) * 100),
        adicionalCent: receitaAdicionalEstimada(m.disponiveis, m.marcados, porMinuto),
      })),
      ticketCent,
      ticketAnteriorCent: ticketMedio(anteriores.map((v) => v.valorCobradoCent)),
      combinacao: combinacao?.map((id) => nome.get(id) ?? "") ?? null,
      cartoesCompletos,
      objetivo: financeiro?.progresso ?? null,
    }),
  };
}
