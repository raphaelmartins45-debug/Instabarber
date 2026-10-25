import { diasEntreDatas } from "@/lib/formatacao/datas";

// A agenda do dia do comercial (D-162): o que tem de fazer hoje. Próximas ações vencidas ou de
// hoje, propostas enviadas a expirar nos próximos 3 dias e barbearias da carteira em risco.

export type LeadAgenda = {
  id: string;
  nome: string;
  telefone: string | null;
  estado: string;
  proxima_acao: string | null;
  proxima_acao_em: string | null;
};
export type PropostaAgenda = {
  lead_id: string;
  numero: string;
  estado: string;
  valida_ate: string | null;
};
export type RiscoAgenda = { inquilinoId: string; nome: string; telefone: string | null };

export type ItemAgenda =
  | {
      tipo: "acao";
      leadId: string;
      nome: string;
      telefone: string | null;
      texto: string;
      atraso: number;
    }
  | {
      tipo: "proposta";
      leadId: string;
      nome: string;
      telefone: string | null;
      numero: string;
      dias: number;
    }
  | { tipo: "risco"; inquilinoId: string; nome: string; telefone: string | null };

export function agendaDoDia(
  leads: LeadAgenda[],
  propostas: PropostaAgenda[],
  riscos: RiscoAgenda[],
  hoje: string,
): ItemAgenda[] {
  const abertos = leads.filter((l) => !["ganho", "perdido"].includes(l.estado));
  const porId = new Map(abertos.map((l) => [l.id, l]));
  const acoes: ItemAgenda[] = abertos
    .filter((l) => l.proxima_acao_em && l.proxima_acao_em <= hoje)
    .map((l) => ({
      tipo: "acao" as const,
      leadId: l.id,
      nome: l.nome,
      telefone: l.telefone,
      texto: l.proxima_acao ?? "",
      atraso: diasEntreDatas(l.proxima_acao_em!, hoje),
    }))
    .sort((a, b) => b.atraso - a.atraso);
  const aExpirar: ItemAgenda[] = propostas
    .filter((p) => p.estado === "enviada" && p.valida_ate && porId.has(p.lead_id))
    .map((p) => ({ p, dias: diasEntreDatas(hoje, p.valida_ate!) }))
    .filter(({ dias }) => dias >= 0 && dias <= 3)
    .map(({ p, dias }) => {
      const l = porId.get(p.lead_id)!;
      return {
        tipo: "proposta" as const,
        leadId: l.id,
        nome: l.nome,
        telefone: l.telefone,
        numero: p.numero,
        dias,
      };
    });
  return [...riscos.map((r) => ({ tipo: "risco" as const, ...r })), ...acoes, ...aExpirar];
}
