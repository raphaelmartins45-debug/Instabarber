import type { ClienteBD } from "@/lib/supabase/tipos";

// Encomenda na página pública (F.4.4): só por criar_pedido_loja(), que confirma os produtos e o
// stock e calcula o total com os preços em vigor.

const motivo = (m: string) => m.match(/^[a-z_]+$/)?.[0] ?? "erro";

export async function criarEncomenda(
  bd: ClienteBD,
  d: {
    inquilinoId: string;
    nome: string;
    telefone: string;
    consentimento: boolean;
    linhas: { produtoId: string; quantidade: number }[];
  },
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const { error } = await bd.rpc("criar_pedido_loja", {
    p_inquilino: d.inquilinoId,
    p_nome: d.nome,
    p_telefone: d.telefone,
    p_consentimento: d.consentimento,
    p_linhas: d.linhas.map((l) => ({ produto_id: l.produtoId, quantidade: l.quantidade })),
  });
  return error ? { ok: false, motivo: motivo(error.message) } : { ok: true };
}
