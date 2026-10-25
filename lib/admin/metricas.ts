import { mesesEntreDatas } from "@/lib/formatacao/datas";
import { ativaNoMes, type BarbeariaFin } from "@/lib/financas/indicadores";

// Métricas de crescimento da InstaBarber (sugestão E), D-159: novas, saídas e ativas por mês,
// tempo como cliente, origem das barbearias e conversão dos leads. Meses «AAAA-MM».

export type LeadMetrica = { estado: string; origem: string; inquilinoId: string | null };

export function serieCrescimento(barbearias: BarbeariaFin[], meses: string[]) {
  return meses.map((mes) => ({
    mes,
    novas: barbearias.filter((b) => b.aprovadaEm?.slice(0, 7) === mes).length,
    saidas: barbearias.filter((b) => b.estado === "cancelado" && b.canceladaEm?.slice(0, 7) === mes)
      .length,
    ativasFim: barbearias.filter((b) => ativaNoMes(b, mes)).length,
  }));
}

/**
 * Saídas mensais médias no período: saídas ÷ soma das ativas no início de cada mês. Só com mais
 * de 10 barbearias, como no Resumo das Finanças (antes disso uma saída dá uma percentagem enganadora).
 */
export function saidasMedias(serie: ReturnType<typeof serieCrescimento>, ativasAntes: number) {
  const inicio = [ativasAntes, ...serie.slice(0, -1).map((m) => m.ativasFim)];
  if (Math.max(...inicio) <= 10) return null;
  const soma = inicio.reduce((s, n) => s + n, 0);
  return soma ? serie.reduce((s, m) => s + m.saidas, 0) / soma : null;
}

/** Tempo médio como cliente, em meses completos: de todas e só das que já saíram. */
export function tempoComoCliente(barbearias: BarbeariaFin[], hoje: string) {
  const aprovadas = barbearias.filter((b) => b.aprovadaEm);
  const meses = (b: BarbeariaFin) =>
    mesesEntreDatas(
      b.aprovadaEm!,
      b.estado === "cancelado" && b.canceladaEm ? b.canceladaEm : hoje,
    );
  const media = (l: BarbeariaFin[]) =>
    l.length ? Math.round((l.reduce((s, b) => s + meses(b), 0) / l.length) * 10) / 10 : null;
  return {
    todas: media(aprovadas),
    queSairam: media(aprovadas.filter((b) => b.estado === "cancelado" && b.canceladaEm)),
  };
}

/** De onde vieram as barbearias aprovadas: a origem do lead ligado, ou adesão direta. */
export function origens(barbearias: (BarbeariaFin & { id: string })[], leads: LeadMetrica[]) {
  const porInquilino = new Map(
    leads.filter((l) => l.inquilinoId).map((l) => [l.inquilinoId!, l.origem]),
  );
  const contagem = new Map<string, number>();
  for (const b of barbearias.filter((x) => x.aprovadaEm)) {
    const o = porInquilino.get(b.id) ?? "direta";
    contagem.set(o, (contagem.get(o) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([origem, n]) => ({ origem, n }))
    .sort((a, b) => b.n - a.n || a.origem.localeCompare(b.origem));
}

/** Conversão dos leads (ganhos ÷ decididos), só com 10 ou mais decididos. */
export function conversaoLeads(leads: LeadMetrica[]) {
  const ganhos = leads.filter((l) => l.estado === "ganho").length;
  const perdidos = leads.filter((l) => l.estado === "perdido").length;
  const decididos = ganhos + perdidos;
  return {
    ganhos,
    perdidos,
    abertos: leads.length - decididos,
    taxa: decididos >= 10 ? ganhos / decididos : null,
  };
}
