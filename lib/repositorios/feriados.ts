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
