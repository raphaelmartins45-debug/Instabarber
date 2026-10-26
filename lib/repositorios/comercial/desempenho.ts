import type { LeadAgenda, PropostaAgenda } from "@/lib/comercial/agenda";
import type {
  ContratoDesempenho,
  LeadDesempenho,
  MetaComercial,
  PropostaDesempenho,
} from "@/lib/comercial/desempenho";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Dados do desempenho comercial (D-161). O comercial só lê os seus (RLS); os administradores
// leem todos e definem as metas.

export async function dadosDesempenho(bd: ClienteBD): Promise<{
  leads: (LeadDesempenho & LeadAgenda)[];
  propostas: (PropostaDesempenho & PropostaAgenda)[];
  contratos: ContratoDesempenho[];
}> {
  const [l, p, c] = await Promise.all([
    bd
      .from("leads")
      .select(
        "id, estado, responsavel_id, criado_em, nome_barbearia, nome_contacto, telefone, proxima_acao, proxima_acao_em, fim_contrato_atual",
      ),
    bd.from("propostas").select("id, lead_id, criado_em, numero, estado, valida_ate"),
    bd.from("contratos").select("lead_id, proposta_id, estado, assinado_em"),
  ]);
  if (l.error) falhaDeLeitura("leads", l.error);
  if (p.error) falhaDeLeitura("propostas", p.error);
  if (c.error) falhaDeLeitura("contratos", c.error);
  return {
    leads: l.data.map((x) => ({ ...x, nome: x.nome_barbearia || x.nome_contacto })),
    propostas: p.data,
    contratos: c.data,
  };
}

/** As metas do mês («AAAA-MM») por comercial. */
export async function metasDoMes(bd: ClienteBD, mes: string): Promise<Map<string, MetaComercial>> {
  const { data, error } = await bd
    .from("metas_comerciais")
    .select("user_id, leads_novos, propostas, ganhos")
    .eq("mes", `${mes}-01`);
  if (error) falhaDeLeitura("metas_comerciais", error);
  return new Map(
    data.map((m) => [
      m.user_id,
      { leadsNovos: m.leads_novos, propostas: m.propostas, ganhos: m.ganhos },
    ]),
  );
}

export async function guardarMetaComercial(
  bd: ClienteBD,
  userId: string,
  mes: string,
  meta: MetaComercial,
): Promise<boolean> {
  const { error } = await bd.from("metas_comerciais").upsert(
    {
      user_id: userId,
      mes: `${mes}-01`,
      leads_novos: meta.leadsNovos,
      propostas: meta.propostas,
      ganhos: meta.ganhos,
    },
    { onConflict: "user_id,mes" },
  );
  return !error;
}

export type BarbeariaCarteira = {
  inquilinoId: string;
  nome: string;
  plano: string;
  estado: string;
  estadoPagamento: string;
  aprovadoEm: string | null;
};

/** A carteira: as barbearias dos leads ganhos (só colunas de estado). Sem userId, a própria. */
export async function carteiraComercial(
  bd: ClienteBD,
  userId?: string,
): Promise<BarbeariaCarteira[]> {
  const { data, error } = await bd.rpc("carteira_comercial", userId ? { p_user: userId } : {});
  if (error) falhaDeLeitura("carteira_comercial", error);
  return data.map((b) => ({
    inquilinoId: b.inquilino_id,
    nome: b.nome,
    plano: b.plano,
    estado: b.estado,
    estadoPagamento: b.estado_pagamento,
    aprovadoEm: b.aprovado_em,
  }));
}
