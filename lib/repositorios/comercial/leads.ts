import { z } from "zod";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { DadosEstado, DadosEvento, esquemaLead } from "@/lib/validacao/comercial";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "../erros";

// Leads e histórico do Comercial (N.3). Só o super_admin com dois fatores os vê (RLS); as
// mudanças de estado e os contactos passam pelas funções da base de dados.

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type EventoLead = Database["public"]["Tables"]["lead_eventos"]["Row"];
export type LeadLinha = Lead & { temPasso2: boolean };

const uuid = z.string().uuid();

/** Ids dos leads que completaram o passo 2 do formulário do site (D-150). */
async function comPasso2(bd: ClienteBD): Promise<Set<string>> {
  const { data, error } = await bd
    .from("lead_eventos")
    .select("lead_id")
    .filter("detalhes->>passo", "eq", "2");
  if (error) falhaDeLeitura("lead_eventos", error);
  return new Set(data.map((e) => e.lead_id));
}

/** Todos os leads, do mais recente para o mais antigo, com a marca do passo 2. */
export async function listarLeads(bd: ClienteBD): Promise<LeadLinha[]> {
  const [{ data, error }, passo2] = await Promise.all([
    bd.from("leads").select("*").order("criado_em", { ascending: false }),
    comPasso2(bd),
  ]);
  if (error) falhaDeLeitura("leads", error);
  return data.map((l) => ({ ...l, temPasso2: passo2.has(l.id) }));
}

export async function obterLead(bd: ClienteBD, id: string): Promise<Lead | null> {
  if (!uuid.safeParse(id).success) return null;
  const { data, error } = await bd.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) falhaDeLeitura("leads", error);
  return data;
}

export async function eventosDoLead(bd: ClienteBD, id: string): Promise<EventoLead[]> {
  const { data, error } = await bd
    .from("lead_eventos")
    .select("*")
    .eq("lead_id", uuid.parse(id))
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("lead_eventos", error);
  return data;
}

/** Mensalidade (sem IVA) da proposta enviada mais recente e ainda válida de cada lead. */
export async function potencialPorLead(bd: ClienteBD): Promise<Map<string, string>> {
  const { data, error } = await bd
    .from("propostas_com_estado")
    .select("lead_id, mensalidade_sem_iva, versao")
    .eq("estado_efetivo", "enviada")
    .order("versao", { ascending: false });
  if (error) falhaDeLeitura("propostas", error);
  const mapa = new Map<string, string>();
  for (const p of data)
    if (p.lead_id && !mapa.has(p.lead_id)) mapa.set(p.lead_id, String(p.mensalidade_sem_iva));
  return mapa;
}

/** Validades das propostas enviadas, para o alerta «a expirar» do painel geral. */
export async function validadesEnviadas(bd: ClienteBD): Promise<string[]> {
  const { data, error } = await bd
    .from("propostas_com_estado")
    .select("valida_ate")
    .eq("estado_efetivo", "enviada");
  if (error) falhaDeLeitura("propostas", error);
  return data.flatMap((p) => (p.valida_ate ? [p.valida_ate] : []));
}

export type LeadValidado = z.output<typeof esquemaLead>;

const linhaLead = (d: LeadValidado) => ({
  nome_contacto: d.nome_contacto,
  nome_barbearia: d.nome_barbearia || null,
  cidade: d.cidade || null,
  telefone: d.telefone ? (telefoneE164(d.telefone) ?? d.telefone) : null,
  email: d.email ? d.email.toLowerCase() : null,
  n_barbeiros: d.n_barbeiros || null,
  origem: d.origem,
});

/** Lead criado à mão (WhatsApp, visita…). O histórico regista quem o criou. */
export async function criarLead(
  bd: ClienteBD,
  dados: LeadValidado,
  autor: string,
): Promise<string | null> {
  const { data, error } = await bd.from("leads").insert(linhaLead(dados)).select("id").single();
  if (error) return null;
  await bd
    .from("lead_eventos")
    .insert({ lead_id: data.id, tipo: "sistema", texto: "Lead criado à mão.", criado_por: autor });
  return data.id;
}

export async function atualizarLead(
  bd: ClienteBD,
  id: string,
  dados: LeadValidado,
): Promise<boolean> {
  const { error } = await bd
    .from("leads")
    .update({ ...linhaLead(dados), atualizado_em: new Date().toISOString() })
    .eq("id", uuid.parse(id));
  return !error;
}

export async function mudarEstadoLead(bd: ClienteBD, id: string, d: DadosEstado): Promise<boolean> {
  const { error } = await bd.rpc("mudar_estado_lead", {
    p_lead: uuid.parse(id),
    p_estado: d.estado,
    p_motivo: d.motivo || undefined,
  });
  return !error;
}

export async function registarEventoLead(
  bd: ClienteBD,
  id: string,
  d: DadosEvento,
): Promise<boolean> {
  const { error } = await bd.rpc("registar_evento_lead", {
    p_lead: uuid.parse(id),
    p_tipo: d.tipo,
    p_texto: d.texto,
    p_proxima_acao: d.proxima_acao || undefined,
    p_proxima_acao_em: d.proxima_acao_em || undefined,
  });
  return !error;
}

/** Rotina mensal (N.9): apaga os leads parados há mais do prazo, sem contrato. Devolve quantos. */
export async function apagarLeadsInativos(bd: ClienteBD, meses = 12): Promise<number | null> {
  const { data, error } = await bd.rpc("apagar_leads_inativos", { p_meses: meses });
  return error ? null : data;
}
