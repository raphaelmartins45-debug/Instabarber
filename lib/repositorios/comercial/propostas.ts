import { z } from "zod";
import { type Briefing, esquemaBriefing } from "@/lib/comercial/briefing";
import type { PropostaMontada } from "@/lib/comercial/proposta";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "../erros";

// Briefing e propostas do Comercial (N.4, N.5). A numeração, as versões, o «substituída», a
// validade e a imutabilidade depois de enviada estão nas funções e nos gatilhos da base de dados.

export type Proposta = Database["public"]["Views"]["propostas_com_estado"]["Row"];
export type PropostaComLead = Proposta & {
  lead: { nome_contacto: string; nome_barbearia: string | null } | null;
};

const uuid = z.string().uuid();

/** O briefing guardado do lead, ou um vazio com os valores por omissão. */
export async function lerBriefing(bd: ClienteBD, leadId: string): Promise<Briefing> {
  const { data, error } = await bd
    .from("briefings")
    .select("dados")
    .eq("lead_id", uuid.parse(leadId))
    .maybeSingle();
  if (error) falhaDeLeitura("briefings", error);
  const v = esquemaBriefing.safeParse(data?.dados ?? {});
  return v.success ? v.data : esquemaBriefing.parse({});
}

export async function guardarBriefing(
  bd: ClienteBD,
  leadId: string,
  dados: Briefing,
  autor: string,
): Promise<boolean> {
  const { error } = await bd.from("briefings").upsert({
    lead_id: uuid.parse(leadId),
    dados,
    atualizado_por: autor,
    atualizado_em: new Date().toISOString(),
  });
  return !error;
}

export async function propostasDoLead(bd: ClienteBD, leadId: string): Promise<Proposta[]> {
  const { data, error } = await bd
    .from("propostas_com_estado")
    .select("*")
    .eq("lead_id", uuid.parse(leadId))
    .order("versao", { ascending: false });
  if (error) falhaDeLeitura("propostas", error);
  return data;
}

export async function listarPropostas(bd: ClienteBD): Promise<PropostaComLead[]> {
  const [{ data, error }, { data: leads, error: e2 }] = await Promise.all([
    bd.from("propostas_com_estado").select("*").order("criado_em", { ascending: false }),
    bd.from("leads").select("id, nome_contacto, nome_barbearia"),
  ]);
  if (error) falhaDeLeitura("propostas", error);
  if (e2) falhaDeLeitura("leads", e2);
  const porId = new Map(leads.map((l) => [l.id, l]));
  return data.map((p) => ({ ...p, lead: (p.lead_id && porId.get(p.lead_id)) || null }));
}

export async function obterProposta(bd: ClienteBD, id: string): Promise<PropostaComLead | null> {
  if (!uuid.safeParse(id).success) return null;
  const { data, error } = await bd
    .from("propostas_com_estado")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) falhaDeLeitura("propostas", error);
  if (!data) return null;
  const { data: lead } = await bd
    .from("leads")
    .select("nome_contacto, nome_barbearia")
    .eq("id", data.lead_id!)
    .maybeSingle();
  return { ...data, lead: lead ?? null };
}

/** Cria uma versão nova (as anteriores abertas ficam «substituída»). Devolve o id ou o erro. */
export async function criarProposta(
  bd: ClienteBD,
  leadId: string,
  p: PropostaMontada,
): Promise<{ id: string } | { erro: string }> {
  const { data, error } = await bd.rpc("criar_proposta", {
    p_lead: uuid.parse(leadId),
    p: p as unknown as Database["public"]["Functions"]["criar_proposta"]["Args"]["p"],
  });
  if (error) return { erro: error.message };
  return { id: data };
}

export async function marcarPropostaEnviada(bd: ClienteBD, id: string): Promise<string | null> {
  const { error } = await bd.rpc("marcar_proposta_enviada", { p_proposta: uuid.parse(id) });
  return error?.message ?? null;
}

export async function decidirProposta(
  bd: ClienteBD,
  id: string,
  aceite: boolean,
  motivo?: string,
): Promise<string | null> {
  const { error } = await bd.rpc("decidir_proposta", {
    p_proposta: uuid.parse(id),
    p_aceite: aceite,
    p_motivo: motivo || undefined,
  });
  return error?.message ?? null;
}

/** Corpo do modelo aprovado mais recente de um tipo (N.8), ou nulo se não houver. */
export async function modeloAprovado(
  bd: ClienteBD,
  tipo: "contrato" | "condicoes_proposta",
): Promise<{ id: string; corpo: string } | null> {
  const { data, error } = await bd
    .from("modelos_documento")
    .select("id, corpo")
    .eq("tipo", tipo)
    .eq("estado", "aprovado")
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) falhaDeLeitura("modelos_documento", error);
  return data;
}
