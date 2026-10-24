import { z } from "zod";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";

// Lembretes de vencimento aos inquilinos (O.9). A lista vem da vista vencimentos_proximos (só o
// super_admin com dois fatores); os lembretes só se escrevem pelas cinco funções da base de
// dados, que fazem cumprir os estados.

const uuid = z.string().uuid();

export type Vencimento = {
  inquilinoId: string;
  nome: string;
  responsavel: string | null;
  plano: string;
  periodicidade: string;
  profissionais: number;
  dominioProprio: string | null;
  estado: string;
  estadoPagamento: string;
  vencimento: string;
  dias: number;
  whatsapp: string | null;
  email: string | null;
  ultimoLembreteEm: string | null;
  lembrete: { id: string; canal: string; estado: string } | null;
};

export async function listarVencimentos(bd: ClienteBD): Promise<Vencimento[]> {
  const { data, error } = await bd
    .from("vencimentos_proximos")
    .select("*")
    .order("proximo_vencimento");
  if (error) falhaDeLeitura("vencimentos_proximos", error);
  const ids = data.map((v) => v.inquilino_id!);
  if (!ids.length) return [];
  const [{ data: fichas, error: e2 }, { data: lembretes, error: e3 }] = await Promise.all([
    bd
      .from("inquilinos")
      .select("id, responsavel, telefone, profissionais_contratados, dominio_proprio")
      .in("id", ids),
    bd
      .from("lembretes_vencimento")
      .select("id, inquilino_id, vencimento, canal, estado")
      .in("inquilino_id", ids)
      .order("criado_em", { ascending: false }),
  ]);
  if (e2) falhaDeLeitura("inquilinos", e2);
  if (e3) falhaDeLeitura("lembretes_vencimento", e3);
  const ficha = new Map(fichas.map((f) => [f.id, f]));
  return data.map((v) => {
    const f = ficha.get(v.inquilino_id!);
    const ultimo = lembretes.find(
      (l) => l.inquilino_id === v.inquilino_id && l.vencimento === v.proximo_vencimento,
    );
    return {
      inquilinoId: v.inquilino_id!,
      nome: v.nome!,
      responsavel: f?.responsavel ?? null,
      plano: v.plano!,
      periodicidade: v.periodicidade!,
      profissionais: f?.profissionais_contratados ?? 1,
      dominioProprio: f?.dominio_proprio ?? null,
      estado: v.estado!,
      estadoPagamento: v.estado_pagamento!,
      vencimento: v.proximo_vencimento!,
      dias: v.dias!,
      whatsapp: v.whatsapp ?? f?.telefone ?? null,
      email: v.email,
      ultimoLembreteEm: v.ultimo_lembrete_em,
      lembrete: ultimo ? { id: ultimo.id, canal: ultimo.canal, estado: ultimo.estado } : null,
    };
  });
}

type Erro = { erro: string };
const codigo = (m: string) => (/^[a-z_]+$/.test(m) ? m : "generico");

export async function prepararLembrete(
  bd: ClienteBD,
  inquilinoId: string,
  canal: "whatsapp" | "email",
  conteudo: string,
): Promise<{ id: string } | Erro> {
  const { data, error } = await bd.rpc("preparar_lembrete_vencimento", {
    p_inquilino: uuid.parse(inquilinoId),
    p_canal: canal,
    p_conteudo: conteudo,
  });
  return error ? { erro: codigo(error.message) } : { id: data };
}

async function chamar(
  bd: ClienteBD,
  funcao:
    | "abrir_lembrete_vencimento"
    | "confirmar_lembrete_vencimento"
    | "cancelar_lembrete_vencimento",
  id: string,
): Promise<string | null> {
  const { error } = await bd.rpc(funcao, { p_id: uuid.parse(id) });
  return error ? codigo(error.message) : null;
}

export const abrirLembrete = (bd: ClienteBD, id: string) =>
  chamar(bd, "abrir_lembrete_vencimento", id);
export const confirmarLembrete = (bd: ClienteBD, id: string) =>
  chamar(bd, "confirmar_lembrete_vencimento", id);
export const cancelarLembrete = (bd: ClienteBD, id: string) =>
  chamar(bd, "cancelar_lembrete_vencimento", id);

export async function registarEmailLembrete(bd: ClienteBD, id: string, ok: boolean) {
  const { error } = await bd.rpc("registar_email_lembrete", { p_id: uuid.parse(id), p_ok: ok });
  return error ? codigo(error.message) : null;
}

/** O lembrete de e-mail falhado, com o texto e o destino, para tentar outra vez. */
export async function lembreteParaReenviar(bd: ClienteBD, id: string) {
  const { data } = await bd
    .from("lembretes_vencimento")
    .select("id, conteudo, vencimento, estado, canal, inquilinos(nome, email)")
    .eq("id", uuid.parse(id))
    .maybeSingle();
  return data;
}
