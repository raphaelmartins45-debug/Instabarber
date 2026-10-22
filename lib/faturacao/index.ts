import "server-only";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { acaoDoModo } from "./emissao";
import type { ModoEmissao } from "./tipos";

// A interface que o núcleo chama ao concluir um serviço (G.4). Com o módulo desligado — sempre,
// na versão 1 — o modo é «nenhum» e o adaptador «manual» não faz nada: tudo como na versão 1.
// Ligado, o modo vem do profissional da marcação (D-03); o documento só se emite quando houver
// programa certificado ligado (D-04).

export async function prepararDocumento(
  bd: ClienteBD,
  d: { inquilinoId: string; marcacaoId: string },
): Promise<{ modo: ModoEmissao; acao: ReturnType<typeof acaoDoModo> }> {
  const { data: ligado } = await bd.rpc("modulo_ativo", {
    p_inquilino: d.inquilinoId,
    p_chave: "faturacao",
  });
  if (ligado !== true) return { modo: "nenhum", acao: "nada" };
  const { data } = await bd
    .from("marcacoes")
    .select("profissionais(modo_emissao)")
    .eq("id", d.marcacaoId)
    .maybeSingle();
  const modo = (data?.profissionais?.modo_emissao ?? "nenhum") as ModoEmissao;
  return { modo, acao: acaoDoModo(modo) };
}
