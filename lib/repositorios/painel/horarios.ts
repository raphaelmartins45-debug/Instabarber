import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Horário próprio de cada profissional (sem linhas, vale o da barbearia).

export type LinhaHorario = {
  profissionalId: string;
  diaSemana: number;
  inicio: string;
  fim: string;
};

export async function listarHorarios(bd: ClienteBD, inquilinoId: string): Promise<LinhaHorario[]> {
  const { data, error } = await bd
    .from("horarios_profissional")
    .select("profissional_id, dia_semana, inicio, fim")
    .eq("inquilino_id", inquilinoId)
    .order("dia_semana")
    .order("inicio");
  if (error) falhaDeLeitura("horarios_profissional", error);
  return data.map((h) => ({
    profissionalId: h.profissional_id,
    diaSemana: h.dia_semana,
    inicio: h.inicio,
    fim: h.fim,
  }));
}

/**
 * Substitui o horário próprio de um profissional (lista vazia = volta ao da barbearia). Devolve
 * nulo, ou o código do erro: «fora_do_horario_barbearia» quando uma faixa sai do horário da
 * barbearia (D-202). Se a gravação falhar, o horário anterior volta a ficar como estava.
 */
export async function gravarHorario(
  bd: ClienteBD,
  inquilinoId: string,
  profissionalId: string,
  linhas: Omit<LinhaHorario, "profissionalId">[],
): Promise<string | null> {
  const linha = (l: Omit<LinhaHorario, "profissionalId">) => ({
    inquilino_id: inquilinoId,
    profissional_id: profissionalId,
    dia_semana: l.diaSemana,
    inicio: l.inicio,
    fim: l.fim,
  });
  const apagar = await bd
    .from("horarios_profissional")
    .delete()
    .eq("inquilino_id", inquilinoId)
    .eq("profissional_id", profissionalId)
    .select("dia_semana, inicio, fim");
  if (apagar.error) return "erro";
  if (linhas.length === 0) return null;
  const { error } = await bd.from("horarios_profissional").insert(linhas.map(linha));
  if (!error) return null;
  await bd
    .from("horarios_profissional")
    .insert(
      apagar.data.map((a) => linha({ diaSemana: a.dia_semana, inicio: a.inicio, fim: a.fim })),
    );
  return error.message.includes("fora_do_horario_barbearia") ? "fora_do_horario_barbearia" : "erro";
}
