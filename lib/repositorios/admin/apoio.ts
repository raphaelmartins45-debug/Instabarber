import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Registo de apoio às barbearias (D-160). Só o super_admin com dois fatores lê e escreve (RLS).

export type RegistoApoio = {
  id: string;
  tipo: string;
  assunto: string;
  texto: string | null;
  estado: string;
  resolvido_em: string | null;
  criado_em: string;
};

export async function listarApoio(bd: ClienteBD, inquilinoId: string): Promise<RegistoApoio[]> {
  const { data, error } = await bd
    .from("apoio_registos")
    .select("id, tipo, assunto, texto, estado, resolvido_em, criado_em")
    .eq("inquilino_id", inquilinoId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("apoio_registos", error);
  return data;
}

/** Os pedidos de apoio em aberto e as barbearias a que pertencem (alerta do painel). */
export async function apoioEmAberto(bd: ClienteBD): Promise<{ n: number; barbearias: string[] }> {
  const { data, error } = await bd
    .from("apoio_registos")
    .select("inquilino_id")
    .eq("estado", "aberto");
  if (error) falhaDeLeitura("apoio_registos", error);
  return { n: data.length, barbearias: [...new Set(data.map((r) => r.inquilino_id))] };
}

export async function criarApoio(
  bd: ClienteBD,
  r: { inquilinoId: string; tipo: string; assunto: string; texto: string; autor: string },
): Promise<boolean> {
  const { error } = await bd.from("apoio_registos").insert({
    inquilino_id: r.inquilinoId,
    tipo: r.tipo,
    assunto: r.assunto,
    texto: r.texto || null,
    criado_por: r.autor,
  });
  return !error;
}

export async function mudarEstadoApoio(bd: ClienteBD, id: string, resolvido: boolean) {
  const { error } = await bd
    .from("apoio_registos")
    .update(
      resolvido
        ? { estado: "resolvido", resolvido_em: new Date().toISOString() }
        : { estado: "aberto", resolvido_em: null },
    )
    .eq("id", id);
  return !error;
}
