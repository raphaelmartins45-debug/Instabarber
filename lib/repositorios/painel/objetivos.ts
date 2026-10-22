import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Objetivos mensais (F.3): da barbearia (profissional nulo) e por profissional (Pro).

export type Objetivo = { profissionalId: string | null; mes: string; valorCent: number };

/** Objetivos de um mês (`mes` = primeiro dia, AAAA-MM-01). */
export async function listarObjetivos(
  bd: ClienteBD,
  inquilinoId: string,
  mes: string,
): Promise<Objetivo[]> {
  const { data, error } = await bd
    .from("objetivos")
    .select("profissional_id, mes, valor")
    .eq("inquilino_id", inquilinoId)
    .eq("mes", mes);
  if (error) falhaDeLeitura("objetivos", error);
  return data.map((o) => ({
    profissionalId: o.profissional_id,
    mes: o.mes,
    valorCent: centimosDeNumeric(o.valor),
  }));
}

/** Histórico dos objetivos de um profissional (ou da barbearia) desde um mês. */
export async function listarObjetivosDesde(
  bd: ClienteBD,
  inquilinoId: string,
  profissionalId: string | null,
  desde: string,
): Promise<Objetivo[]> {
  let q = bd
    .from("objetivos")
    .select("profissional_id, mes, valor")
    .eq("inquilino_id", inquilinoId)
    .gte("mes", desde);
  q = profissionalId ? q.eq("profissional_id", profissionalId) : q.is("profissional_id", null);
  const { data, error } = await q;
  if (error) falhaDeLeitura("objetivos", error);
  return data.map((o) => ({
    profissionalId: o.profissional_id,
    mes: o.mes,
    valorCent: centimosDeNumeric(o.valor),
  }));
}

export async function gravarObjetivo(
  bd: ClienteBD,
  inquilinoId: string,
  objetivo: Objetivo,
): Promise<boolean> {
  const { error } = await bd.from("objetivos").upsert(
    {
      inquilino_id: inquilinoId,
      profissional_id: objetivo.profissionalId,
      mes: objetivo.mes,
      valor: numericParaGravar(objetivo.valorCent),
    },
    { onConflict: "inquilino_id,profissional_id,mes" },
  );
  return !error;
}
