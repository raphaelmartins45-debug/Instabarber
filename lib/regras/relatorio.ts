import { diaSemanaDe, hojeIso } from "@/lib/formatacao/datas";
import { classificar, faturacaoARecuperar, ticketMedio } from "./classificacao";

// Os números do relatório mensal (E.5) que não existem noutro sítio do painel: retenção,
// serviços, operação e a combinação de serviços mais procurada. A faturação, a receita e os
// acertos vêm das mesmas funções do Início e do Financeiro.

export type VisitaRelatorio = {
  clienteId: string;
  servicoId: string;
  profissionalId: string | null;
  data: string;
  valorCobradoCent: number;
};

export type Periodo = { de: Date; ate: Date };

const DIA_MS = 86_400_000;
/** Uma visita conta como recuperada até 30 dias depois da mensagem de recuperação (E.5). */
export const DIAS_RECUPERACAO = 30;

export const dentro = (data: string, p: Periodo) => {
  const t = new Date(data).getTime();
  return t >= p.de.getTime() && t < p.ate.getTime();
};

/** Variação em percentagem, com uma casa; nula sem valor anterior. */
export function variacaoPercent(atual: number, anterior: number): number | null {
  if (anterior <= 0) return null;
  return Math.round(((atual - anterior) / anterior) * 1000) / 10;
}

export type Retencao = {
  atendidos: number;
  novos: number;
  recuperados: number;
  /** Recuperados sem mensagem de recuperação nos 30 dias anteriores (o argumento do Basic). */
  voltaramSozinhos: number;
  /** Valor cobrado das visitas recuperadas por mensagem (caixa «O sistema pagou-se sozinho»). */
  recuperadaCent: number;
  ativos: number;
  emRisco: number;
  perdidos: number;
  aRecuperarCent: number;
};

/**
 * Retenção do período. Um cliente é recuperado quando chega «em risco» ou «perdido» (F.1, com o
 * histórico anterior à visita). A classificação final é a do fim do período (ou de agora).
 */
export function retencao(
  visitas: readonly VisitaRelatorio[],
  p: Periodo,
  mensagensRecuperacao: readonly { clienteId: string; abertaEm: string }[],
  agora: Date = new Date(),
): Retencao {
  const ref = new Date(Math.min(agora.getTime(), p.ate.getTime()));
  const porCliente = new Map<string, VisitaRelatorio[]>();
  for (const v of visitas)
    if (new Date(v.data) < ref || dentro(v.data, p))
      porCliente.set(v.clienteId, [...(porCliente.get(v.clienteId) ?? []), v]);
  const r: Retencao = {
    atendidos: 0,
    novos: 0,
    recuperados: 0,
    voltaramSozinhos: 0,
    recuperadaCent: 0,
    ativos: 0,
    emRisco: 0,
    perdidos: 0,
    aRecuperarCent: 0,
  };
  const perdidos: { estado: "perdido"; ticketMedioCent: number }[] = [];
  for (const [clienteId, lista] of porCliente) {
    const ordem = [...lista].sort((a, b) => a.data.localeCompare(b.data));
    const doPeriodo = ordem.filter((v) => dentro(v.data, p));
    if (doPeriodo.length) r.atendidos++;
    if (doPeriodo.length && ordem[0] === doPeriodo[0]) r.novos++;
    let recuperado = false;
    let comMensagem = false;
    for (const v of doPeriodo) {
      const antes = ordem.filter((x) => x.data < v.data).map((x) => x.data);
      if (antes.length === 0) continue;
      const estado = classificar(antes, new Date(v.data)).estado;
      if (estado !== "em_risco" && estado !== "perdido") continue;
      recuperado = true;
      const t = new Date(v.data).getTime();
      const porMensagem = mensagensRecuperacao.some(
        (m) =>
          m.clienteId === clienteId &&
          new Date(m.abertaEm).getTime() <= t &&
          t - new Date(m.abertaEm).getTime() <= DIAS_RECUPERACAO * DIA_MS,
      );
      if (porMensagem) {
        comMensagem = true;
        r.recuperadaCent += v.valorCobradoCent;
      }
    }
    if (recuperado) r.recuperados++;
    if (recuperado && !comMensagem) r.voltaramSozinhos++;
    const historico = ordem.filter((v) => new Date(v.data) <= ref);
    if (historico.length === 0) continue;
    const estado = classificar(
      historico.map((v) => v.data),
      ref,
    ).estado;
    if (estado === "ativo") r.ativos++;
    if (estado === "em_risco") r.emRisco++;
    if (estado === "perdido") {
      r.perdidos++;
      perdidos.push({
        estado,
        ticketMedioCent: ticketMedio(historico.map((v) => v.valorCobradoCent)),
      });
    }
  }
  r.aRecuperarCent = faturacaoARecuperar(perdidos);
  return r;
}

export type LinhaServico = {
  servicoId: string;
  quantidade: number;
  receitaCent: number;
  /** Peso na faturação do período, em percentagem com uma casa. */
  peso: number;
};

export function servicosDoPeriodo(visitas: readonly VisitaRelatorio[]): LinhaServico[] {
  const total = visitas.reduce((a, v) => a + v.valorCobradoCent, 0);
  const mapa = new Map<string, { quantidade: number; receitaCent: number }>();
  for (const v of visitas) {
    const l = mapa.get(v.servicoId) ?? { quantidade: 0, receitaCent: 0 };
    mapa.set(v.servicoId, {
      quantidade: l.quantidade + 1,
      receitaCent: l.receitaCent + v.valorCobradoCent,
    });
  }
  return [...mapa]
    .map(([servicoId, l]) => ({
      servicoId,
      ...l,
      peso: total > 0 ? Math.round((l.receitaCent / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.receitaCent - a.receitaCent);
}

/** O par de serviços feito mais vezes pelo mesmo cliente no mesmo dia; nulo se não houver. */
export function combinacaoMaisProcurada(visitas: readonly VisitaRelatorio[]): string[] | null {
  const dias = new Map<string, Set<string>>();
  for (const v of visitas) {
    const k = `${v.clienteId}|${hojeIso(new Date(v.data))}`;
    dias.set(k, (dias.get(k) ?? new Set()).add(v.servicoId));
  }
  const pares = new Map<string, number>();
  for (const s of dias.values()) {
    const ids = [...s].sort();
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        const k = `${ids[i]}|${ids[j]}`;
        pares.set(k, (pares.get(k) ?? 0) + 1);
      }
  }
  const melhor = [...pares].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return melhor ? melhor[0].split("|") : null;
}

/** Faturação por dia da semana (0 = domingo), só dos dias com visitas. */
export function faturacaoPorDiaSemana(visitas: readonly VisitaRelatorio[]): Map<number, number> {
  const mapa = new Map<number, number>();
  for (const v of visitas) {
    const d = diaSemanaDe(hojeIso(new Date(v.data)));
    mapa.set(d, (mapa.get(d) ?? 0) + v.valorCobradoCent);
  }
  return mapa;
}

/** Taxa de faltas: faltas ÷ (concluídas + faltas), em percentagem com uma casa. */
export function taxaFaltas(estados: readonly string[]): number | null {
  const faltas = estados.filter((e) => e === "falta").length;
  const base = faltas + estados.filter((e) => e === "concluida").length;
  return base > 0 ? Math.round((faltas / base) * 1000) / 10 : null;
}

/** Antecedência média das marcações, em dias com uma casa: do pedido ao início. */
export function antecedenciaMedia(marcacoes: readonly { criadoEm: string; inicio: string }[]) {
  if (marcacoes.length === 0) return null;
  const soma = marcacoes.reduce(
    (a, m) => a + Math.max(0, new Date(m.inicio).getTime() - new Date(m.criadoEm).getTime()),
    0,
  );
  return Math.round((soma / marcacoes.length / DIA_MS) * 10) / 10;
}
