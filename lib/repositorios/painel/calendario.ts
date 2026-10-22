import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Ausências, feriados próprios e períodos de desconto (E.2, F.4.7). Só o gestor escreve (RLS).

export async function criarAusencia(
  bd: ClienteBD,
  d: {
    inquilinoId: string;
    profissionalId: string | null;
    inicio: string;
    fim: string;
    tipo: string;
    motivo: string | null;
    criadoPor: string;
  },
): Promise<boolean> {
  const { error } = await bd.from("ausencias").insert({
    inquilino_id: d.inquilinoId,
    profissional_id: d.profissionalId,
    inicio: d.inicio,
    fim: d.fim,
    tipo: d.tipo,
    motivo: d.motivo,
    criado_por: d.criadoPor,
  });
  return !error;
}

export async function removerAusencia(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("ausencias")
    .delete()
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("id");
  return !error && data.length > 0;
}

export async function criarFeriado(
  bd: ClienteBD,
  inquilinoId: string,
  data: string,
  nome: string,
): Promise<boolean> {
  const { error } = await bd.from("feriados").insert({ inquilino_id: inquilinoId, data, nome });
  return !error;
}

export async function removerFeriado(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("feriados")
    .delete()
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("id");
  return !error && data.length > 0;
}

export type Periodo = {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  percentagem: number;
  ativo: boolean;
};

export async function listarPeriodos(bd: ClienteBD, inquilinoId: string): Promise<Periodo[]> {
  const { data, error } = await bd
    .from("periodos_desconto")
    .select("id, dia_semana, hora_inicio, hora_fim, percentagem, ativo")
    .eq("inquilino_id", inquilinoId)
    .order("dia_semana")
    .order("hora_inicio");
  if (error) falhaDeLeitura("periodos_desconto", error);
  return data.map((p) => ({
    id: p.id,
    diaSemana: p.dia_semana,
    horaInicio: p.hora_inicio,
    horaFim: p.hora_fim,
    percentagem: Number(p.percentagem),
    ativo: p.ativo,
  }));
}

export async function criarPeriodo(
  bd: ClienteBD,
  inquilinoId: string,
  p: Omit<Periodo, "id" | "ativo">,
): Promise<boolean> {
  const { error } = await bd.from("periodos_desconto").insert({
    inquilino_id: inquilinoId,
    dia_semana: p.diaSemana,
    hora_inicio: p.horaInicio,
    hora_fim: p.horaFim,
    percentagem: p.percentagem,
  });
  return !error;
}

export async function alternarPeriodo(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
  ativo: boolean,
) {
  const { error } = await bd
    .from("periodos_desconto")
    .update({ ativo })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id);
  return !error;
}

export async function removerPeriodo(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("periodos_desconto")
    .delete()
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("id");
  return !error && data.length > 0;
}
