import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";

// Desempenho de cada comercial (D-161), como o painel do barbeiro: números do mês contra as
// metas, conversão e comissão (a taxa de migração dos contratos que assinou, quando ligada).
// Meses «AAAA-MM»; datas e instantes em ISO.

export type LeadDesempenho = {
  id: string;
  estado: string;
  responsavel_id: string | null;
  criado_em: string;
};
export type PropostaDesempenho = {
  id: string;
  lead_id: string;
  criado_em: string;
  taxa_migracao_sem_iva: number | string;
};
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
  comissaoCent: number;
};

const doMes = (iso: string | null, mes: string) => !!iso && iso.slice(0, 7) === mes;

/** Os números de um comercial num mês. A conversão (ganhos ÷ decididos) só com 10 decididos. */
export function desempenhoDoMes(
  userId: string,
  mes: string,
  leads: LeadDesempenho[],
  propostas: PropostaDesempenho[],
  contratos: ContratoDesempenho[],
  taxaAtiva: boolean,
): Desempenho {
  const meus = leads.filter((l) => l.responsavel_id === userId);
  const ids = new Set(meus.map((l) => l.id));
  const assinados = contratos.filter(
    (c) => ids.has(c.lead_id) && ["assinado", "terminado"].includes(c.estado),
  );
  const assinadosNoMes = assinados.filter((c) => doMes(c.assinado_em, mes));
  const taxa = new Map(propostas.map((p) => [p.id, centimosDeNumeric(p.taxa_migracao_sem_iva)]));
  const ganhos = meus.filter((l) => l.estado === "ganho").length;
  const decididos = ganhos + meus.filter((l) => l.estado === "perdido").length;
  return {
    leadsNovos: meus.filter((l) => doMes(l.criado_em, mes)).length,
    propostas: propostas.filter((p) => ids.has(p.lead_id) && doMes(p.criado_em, mes)).length,
    ganhos: assinadosNoMes.length,
    abertos: meus.filter((l) => !["ganho", "perdido"].includes(l.estado)).length,
    conversao: decididos >= 10 ? ganhos / decididos : null,
    comissaoCent: taxaAtiva
      ? assinadosNoMes.reduce((s, c) => s + (taxa.get(c.proposta_id) ?? 0), 0)
      : 0,
  };
}

/** Percentagem de uma meta (0 a 100+, inteira); nula sem meta. */
export const progressoMeta = (feito: number, meta: number) =>
  meta > 0 ? Math.round((feito / meta) * 100) : null;
