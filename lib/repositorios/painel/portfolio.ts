import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Portfólio do barbeiro (F.4.6): até seis fotografias (gatilho limitar_portfolio). O bloco
// público aparece com «Tornar visível» (profissionais.portfolio_visivel).

export type FotoPortfolio = { id: string; url: string; ordem: number };

export async function listarPortfolio(
  bd: ClienteBD,
  profissionalId: string,
): Promise<FotoPortfolio[]> {
  const { data, error } = await bd
    .from("portfolio_fotos")
    .select("id, foto_url, ordem")
    .eq("profissional_id", profissionalId)
    .order("ordem")
    .order("criado_em");
  if (error) falhaDeLeitura("portfolio_fotos", error);
  return data.map((f) => ({ id: f.id, url: f.foto_url, ordem: f.ordem }));
}

export async function acrescentarFoto(
  bd: ClienteBD,
  inquilinoId: string,
  profissionalId: string,
  url: string,
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const { error } = await bd.from("portfolio_fotos").insert({
    inquilino_id: inquilinoId,
    profissional_id: profissionalId,
    foto_url: url,
    visivel: true,
  });
  if (!error) return { ok: true };
  return { ok: false, motivo: error.message.includes("limite_portfolio") ? "limite" : "erro" };
}

/** Remove a fotografia e devolve o URL, para apagar o ficheiro. */
export async function removerFoto(bd: ClienteBD, id: string): Promise<string | null> {
  const { data, error } = await bd.from("portfolio_fotos").delete().eq("id", id).select("foto_url");
  if (error || data.length === 0) return null;
  return data[0]!.foto_url;
}
