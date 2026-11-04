import { differenceInMinutes } from "date-fns";
import { hojeIso, instanteLocal, somarDias } from "@/lib/formatacao/datas";

// Contas dos gráficos do Início (D-203): faturação por dia, totais por barbeiro ou serviço e a
// posição de cada marcação na linha do tempo do dia. Puras, para os testes.

type ComValor = { data: string; valorCobradoCent: number };

/** A faturação de cada um dos últimos `n` dias até `hoje` (inclusive), em cêntimos. */
export function faturacaoPorDia(
  visitas: readonly ComValor[],
  hoje: string,
  n = 30,
): { dia: string; cent: number }[] {
  const dias = Array.from({ length: n }, (_, i) => somarDias(hoje, i - n + 1));
  const soma = new Map(dias.map((d) => [d, 0]));
  for (const v of visitas) {
    const d = hojeIso(new Date(v.data));
    if (soma.has(d)) soma.set(d, soma.get(d)! + v.valorCobradoCent);
  }
  return dias.map((dia) => ({ dia, cent: soma.get(dia)! }));
}

/** Totais em cêntimos agrupados por uma chave, do maior para o menor. */
export function totaisPor<T extends { valorCobradoCent: number }>(
  linhas: readonly T[],
  chave: (l: T) => string | null,
): { id: string; cent: number }[] {
  const soma = new Map<string, number>();
  for (const l of linhas) {
    const k = chave(l);
    if (k) soma.set(k, (soma.get(k) ?? 0) + l.valorCobradoCent);
  }
  return [...soma.entries()].map(([id, cent]) => ({ id, cent })).sort((a, b) => b.cent - a.cent);
}

/**
 * A posição de um período na linha do tempo do dia, em percentagem da largura (das `abertura`
 * às `fecho`, horas de Lisboa). Fora do dia, corta nas pontas; devolve nulo se não se vê.
 */
export function posicaoNoDia(
  periodo: { inicio: string | Date; fim: string | Date },
  dia: string,
  abertura: string,
  fecho: string,
): { esquerda: number; largura: number } | null {
  const a = instanteLocal(dia, abertura.slice(0, 5));
  const f = instanteLocal(dia, fecho.slice(0, 5));
  const total = differenceInMinutes(f, a);
  if (total <= 0) return null;
  const ini = Math.max(0, differenceInMinutes(new Date(periodo.inicio), a));
  const fim = Math.min(total, differenceInMinutes(new Date(periodo.fim), a));
  if (fim <= ini) return null;
  return { esquerda: (ini / total) * 100, largura: ((fim - ini) / total) * 100 };
}
