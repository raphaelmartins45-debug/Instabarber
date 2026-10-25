// Desempenho de cada comercial (D-161), como o painel do barbeiro: números do mês contra as
// metas e conversão. As comissões têm tabela própria (lib/comercial/comissoes.ts, D-162).
// Meses «AAAA-MM»; datas e instantes em ISO.

export type LeadDesempenho = {
  id: string;
  estado: string;
  responsavel_id: string | null;
  criado_em: string;
};
export type PropostaDesempenho = { id: string; lead_id: string; criado_em: string };
export type ContratoDesempenho = {
  lead_id: string;
  proposta_id: string;
  estado: string;
  assinado_em: string | null;
};
export type MetaComercial = { leadsNovos: number; propostas: number; ganhos: number };

export type Desempenho = {
  leadsNovos: number;
  propostas: number;
  ganhos: number;
  abertos: number;
  conversao: number | null;
};

const doMes = (iso: string | null, mes: string) => !!iso && iso.slice(0, 7) === mes;

/** Os números de um comercial num mês. A conversão (ganhos ÷ decididos) só com 10 decididos. */
export function desempenhoDoMes(
  userId: string,
  mes: string,
  leads: LeadDesempenho[],
  propostas: PropostaDesempenho[],
  contratos: ContratoDesempenho[],
): Desempenho {
  const meus = leads.filter((l) => l.responsavel_id === userId);
  const ids = new Set(meus.map((l) => l.id));
  const assinados = contratos.filter(
    (c) => ids.has(c.lead_id) && ["assinado", "terminado"].includes(c.estado),
  );
  const assinadosNoMes = assinados.filter((c) => doMes(c.assinado_em, mes));
  const ganhos = meus.filter((l) => l.estado === "ganho").length;
  const decididos = ganhos + meus.filter((l) => l.estado === "perdido").length;
  return {
    leadsNovos: meus.filter((l) => doMes(l.criado_em, mes)).length,
    propostas: propostas.filter((p) => ids.has(p.lead_id) && doMes(p.criado_em, mes)).length,
    ganhos: assinadosNoMes.length,
    abertos: meus.filter((l) => !["ganho", "perdido"].includes(l.estado)).length,
    conversao: decididos >= 10 ? ganhos / decididos : null,
  };
}

/** Percentagem de uma meta (0 a 100+, inteira); nula sem meta. */
export const progressoMeta = (feito: number, meta: number) =>
  meta > 0 ? Math.round((feito / meta) * 100) : null;
