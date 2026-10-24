import { z } from "zod";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "./erros";

export type Feriado = Database["public"]["Tables"]["feriados"]["Row"];

const uuid = z.string().uuid();
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Feriados entre duas datas (inclusive, `aaaa-mm-dd`): os nacionais e os da barbearia.
 * O RLS decide o que cada papel vê; o anónimo só recebe os nacionais.
 */
export async function listarFeriados(
  bd: ClienteBD,
  inquilinoId: string,
  de: string,
  ate: string,
): Promise<Feriado[]> {
  // O id entra num filtro do PostgREST: valida-se antes para não abrir caminho a filtros injetados.
  const id = uuid.parse(inquilinoId);
  const { data, error } = await bd
    .from("feriados")
    .select("*")
    .or(`inquilino_id.is.null,inquilino_id.eq.${id}`)
    .gte("data", dia.parse(de))
    .lte("data", dia.parse(ate))
    .order("data");
  if (error) falhaDeLeitura("feriados", error);
  return data;
}

/** Quantos feriados nacionais (inquilino nulo) há carregados num ano (alerta de novembro, C.8). */
export async function contarFeriadosNacionais(bd: ClienteBD, ano: number): Promise<number> {
  const { count, error } = await bd
    .from("feriados")
    .select("id", { count: "exact", head: true })
    .is("inquilino_id", null)
    .gte("data", `${ano}-01-01`)
    .lte("data", `${ano}-12-31`);
  if (error) falhaDeLeitura("feriados", error);
  return count ?? 0;
}

/** Datas dos feriados nacionais entre duas datas (dias úteis do Comercial, N.3). */
export async function datasFeriadosNacionais(
  bd: ClienteBD,
  de: string,
  ate: string,
): Promise<Set<string>> {
  const { data, error } = await bd
    .from("feriados")
    .select("data")
    .is("inquilino_id", null)
    .gte("data", dia.parse(de))
    .lte("data", dia.parse(ate));
  if (error) falhaDeLeitura("feriados", error);
  return new Set(data.map((f) => f.data));
}
