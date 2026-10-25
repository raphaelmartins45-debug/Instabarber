import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Comunicados da InstaBarber no Início do gestor (D-160). A base de dados decide quais são
// (meus_comunicados: só o gestor da barbearia, em vigor e ainda não lidos).

export type ComunicadoPainel = { id: string; titulo: string; texto: string };

export async function meusComunicados(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<ComunicadoPainel[]> {
  const { data, error } = await bd.rpc("meus_comunicados", { p_inquilino: inquilinoId });
  if (error) falhaDeLeitura("meus_comunicados", error);
  return data.map((c) => ({ id: c.id, titulo: c.titulo, texto: c.texto }));
}

export async function marcarComunicadoLido(bd: ClienteBD, id: string, inquilinoId: string) {
  const { error } = await bd.rpc("marcar_comunicado_lido", {
    p_comunicado: id,
    p_inquilino: inquilinoId,
  });
  return !error;
}
