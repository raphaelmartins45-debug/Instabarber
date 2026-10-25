import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Comunicados aos gestores (D-160), do lado do admin. Só o super_admin com dois fatores (RLS).

export type Comunicado = {
  id: string;
  titulo: string;
  texto: string;
  destino: string;
  plano: string | null;
  inquilinoId: string | null;
  inicio: string;
  fim: string | null;
  lidas: string[];
};

export async function listarComunicados(bd: ClienteBD): Promise<Comunicado[]> {
  const { data, error } = await bd
    .from("comunicados")
    .select(
      "id, titulo, texto, destino, plano, inquilino_id, inicio, fim, comunicado_leituras(inquilino_id)",
    )
    .order("inicio", { ascending: false });
  if (error) falhaDeLeitura("comunicados", error);
  return data.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    texto: c.texto,
    destino: c.destino,
    plano: c.plano,
    inquilinoId: c.inquilino_id,
    inicio: c.inicio,
    fim: c.fim,
    lidas: c.comunicado_leituras.map((l) => l.inquilino_id),
  }));
}

export async function criarComunicado(
  bd: ClienteBD,
  c: Omit<Comunicado, "id" | "lidas"> & { autor: string },
): Promise<boolean> {
  const { error } = await bd.from("comunicados").insert({
    titulo: c.titulo,
    texto: c.texto,
    destino: c.destino,
    plano: c.plano,
    inquilino_id: c.inquilinoId,
    inicio: c.inicio,
    fim: c.fim,
    criado_por: c.autor,
  });
  return !error;
}

/** Termina agora: sai do painel dos gestores; fica no histórico com as leituras. */
export async function terminarComunicado(bd: ClienteBD, id: string): Promise<boolean> {
  const agora = new Date().toISOString();
  const { data, error } = await bd
    .from("comunicados")
    .update({ fim: agora })
    .eq("id", id)
    .lt("inicio", agora)
    .select("id");
  return !error && data.length === 1;
}

export async function apagarComunicado(bd: ClienteBD, id: string): Promise<boolean> {
  const { error } = await bd.from("comunicados").delete().eq("id", id);
  return !error;
}

/** As barbearias para escolher o destino e preparar o aviso por WhatsApp. */
export async function barbeariasParaComunicados(bd: ClienteBD) {
  const { data, error } = await bd
    .from("inquilinos")
    .select("id, nome, plano, estado, whatsapp, telefone")
    .in("estado", ["ativo", "suspenso"])
    .eq("demonstracao", false)
    .order("nome");
  if (error) falhaDeLeitura("inquilinos", error);
  return data.map((b) => ({ ...b, whatsapp: b.whatsapp ?? b.telefone }));
}
