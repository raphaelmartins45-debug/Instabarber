import { z } from "zod";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database, Json } from "@/types/database";
import { falhaDeLeitura } from "../erros";

// Modelos de documento, contratos e convites de adesão (N.6 a N.8). A numeração, a exigência do
// modelo aprovado, a imutabilidade depois de assinado e o «ganho» do lead estão na base de dados.

export type Modelo = Database["public"]["Tables"]["modelos_documento"]["Row"];
export type Contrato = Database["public"]["Tables"]["contratos"]["Row"];
export type TipoModelo = "contrato" | "condicoes_proposta";

const uuid = z.string().uuid();
export const BUCKET_COMERCIAL = "comercial";

export async function listarModelos(bd: ClienteBD): Promise<Modelo[]> {
  const { data, error } = await bd
    .from("modelos_documento")
    .select("*")
    .order("tipo")
    .order("versao", { ascending: false });
  if (error) falhaDeLeitura("modelos_documento", error);
  return data;
}

export async function obterModelo(bd: ClienteBD, id: string): Promise<Modelo | null> {
  if (!uuid.safeParse(id).success) return null;
  const { data, error } = await bd.from("modelos_documento").select("*").eq("id", id).maybeSingle();
  if (error) falhaDeLeitura("modelos_documento", error);
  return data;
}

/** Versão nova em rascunho (a seguir à mais alta do tipo). Devolve o id. */
export async function criarModelo(
  bd: ClienteBD,
  tipo: TipoModelo,
  titulo: string,
  corpo: string,
): Promise<string | null> {
  const { data: ultima } = await bd
    .from("modelos_documento")
    .select("versao")
    .eq("tipo", tipo)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data, error } = await bd
    .from("modelos_documento")
    .insert({ tipo, versao: (ultima?.versao ?? 0) + 1, titulo, corpo })
    .select("id")
    .single();
  return error ? null : data.id;
}

/** Só um rascunho se edita: um modelo aprovado ou arquivado não muda (N.8). */
export async function editarRascunho(
  bd: ClienteBD,
  id: string,
  titulo: string,
  corpo: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("modelos_documento")
    .update({ titulo, corpo })
    .eq("id", uuid.parse(id))
    .eq("estado", "rascunho")
    .select("id");
  return !error && data.length === 1;
}

/** Aprovar: regista quem e quando; o aprovado anterior do mesmo tipo passa a arquivado. */
export async function aprovarModelo(bd: ClienteBD, id: string, autor: string): Promise<boolean> {
  const modelo = await obterModelo(bd, id);
  if (!modelo || modelo.estado !== "rascunho") return false;
  await bd
    .from("modelos_documento")
    .update({ estado: "arquivado" })
    .eq("tipo", modelo.tipo)
    .eq("estado", "aprovado");
  const { error } = await bd
    .from("modelos_documento")
    .update({ estado: "aprovado", aprovado_por: autor, aprovado_em: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export async function contratosDoLead(bd: ClienteBD, leadId: string): Promise<Contrato[]> {
  const { data, error } = await bd
    .from("contratos")
    .select("*")
    .eq("lead_id", uuid.parse(leadId))
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("contratos", error);
  return data;
}

export type ContratoComLead = Contrato & {
  lead: { nome_contacto: string; nome_barbearia: string | null } | null;
};

export async function listarContratos(bd: ClienteBD): Promise<ContratoComLead[]> {
  const [{ data, error }, { data: leads, error: e2 }] = await Promise.all([
    bd.from("contratos").select("*").order("criado_em", { ascending: false }),
    bd.from("leads").select("id, nome_contacto, nome_barbearia"),
  ]);
  if (error) falhaDeLeitura("contratos", error);
  if (e2) falhaDeLeitura("leads", e2);
  const porId = new Map(leads.map((l) => [l.id, l]));
  return data.map((c) => ({ ...c, lead: porId.get(c.lead_id) ?? null }));
}

export async function obterContrato(bd: ClienteBD, id: string): Promise<Contrato | null> {
  if (!uuid.safeParse(id).success) return null;
  const { data, error } = await bd.from("contratos").select("*").eq("id", id).maybeSingle();
  if (error) falhaDeLeitura("contratos", error);
  return data;
}

/** gerar_contrato (N.6). Devolve o id do contrato ou o código de erro da base de dados. */
export async function gerarContrato(
  bd: ClienteBD,
  propostaId: string,
  modeloId: string,
  dados: Record<string, string>,
  texto: string,
): Promise<{ id: string } | { erro: string }> {
  const { data, error } = await bd.rpc("gerar_contrato", {
    p_proposta: uuid.parse(propostaId),
    p_modelo: uuid.parse(modeloId),
    p_dados: dados as Json,
    p_texto: texto,
  });
  return error ? { erro: error.message } : { id: data };
}

/** O texto final com o número do contrato (o rascunho ainda se pode atualizar). */
export async function fixarTextoContrato(
  bd: ClienteBD,
  id: string,
  texto: string,
): Promise<boolean> {
  const { error } = await bd
    .from("contratos")
    .update({ texto })
    .eq("id", uuid.parse(id))
    .eq("estado", "rascunho");
  return !error;
}

export async function marcarContratoEnviado(bd: ClienteBD, id: string): Promise<string | null> {
  const { error } = await bd.rpc("marcar_contrato_enviado", { p_contrato: uuid.parse(id) });
  return error?.message ?? null;
}

/** Token de um URL assinado para carregar o PDF assinado no bucket privado `comercial`. */
export async function urlCarregamentoAssinado(
  bd: ClienteBD,
  caminho: string,
): Promise<string | null> {
  const { data, error } = await bd.storage
    .from(BUCKET_COMERCIAL)
    .createSignedUploadUrl(caminho, { upsert: true });
  return error ? null : data.token;
}

export async function assinarContrato(
  bd: ClienteBD,
  id: string,
  data: string,
  caminho: string,
  inicio?: string,
): Promise<string | null> {
  const { error } = await bd.rpc("assinar_contrato", {
    p_contrato: uuid.parse(id),
    p_data: data,
    p_pdf_assinado: caminho,
    p_inicio: inicio || undefined,
  });
  return error?.message ?? null;
}

/** URL temporário (10 minutos) para descarregar o PDF assinado. */
export async function urlPdfAssinado(bd: ClienteBD, caminho: string): Promise<string | null> {
  const { data } = await bd.storage.from(BUCKET_COMERCIAL).createSignedUrl(caminho, 600);
  return data?.signedUrl ?? null;
}

/** Convite de adesão (N.7): só o hash do código fica guardado. */
export async function criarConviteAdesao(
  bd: ClienteBD,
  contratoId: string,
  token: string,
  dados: Record<string, unknown>,
): Promise<string | null> {
  const { error } = await bd.rpc("criar_convite_adesao", {
    p_contrato: uuid.parse(contratoId),
    p_token: token,
    p_dados: dados as Json,
  });
  return error?.message ?? null;
}

/** Na aprovação do pedido que veio por convite, liga o contrato e o lead à barbearia criada. */
export async function ligarContratoInquilino(
  bd: ClienteBD,
  contratoId: string,
  inquilinoId: string,
): Promise<boolean> {
  const { error } = await bd.rpc("ligar_contrato_inquilino", {
    p_contrato: uuid.parse(contratoId),
    p_inquilino: uuid.parse(inquilinoId),
  });
  return !error;
}
