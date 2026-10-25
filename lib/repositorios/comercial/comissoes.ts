import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Comissões dos comerciais (D-162). O comercial lê as suas (RLS); os administradores leem todas
// e registam o pagamento da taxa e da comissão pelas funções da base de dados.

export type ComissaoLinha = {
  id: string;
  comercialId: string | null;
  valor: number;
  estado: string;
  taxa_paga_em: string | null;
  vence_em: string | null;
  paga_em: string | null;
  contrato: string;
  barbearia: string;
};

export async function listarComissoes(bd: ClienteBD): Promise<ComissaoLinha[]> {
  const { data, error } = await bd
    .from("comissoes_comerciais")
    .select(
      "id, comercial_id, valor, estado, taxa_paga_em, vence_em, paga_em, contratos(numero, leads(nome_barbearia, nome_contacto))",
    )
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("comissoes_comerciais", error);
  return data.map((c) => ({
    id: c.id,
    comercialId: c.comercial_id,
    valor: Number(c.valor),
    estado: c.estado,
    taxa_paga_em: c.taxa_paga_em,
    vence_em: c.vence_em,
    paga_em: c.paga_em,
    contrato: c.contratos?.numero ?? "",
    barbearia: c.contratos?.leads?.nome_barbearia || c.contratos?.leads?.nome_contacto || "",
  }));
}

export async function registarTaxaPaga(bd: ClienteBD, id: string, data: string) {
  const { error } = await bd.rpc("registar_taxa_paga", { p_comissao: id, p_data: data });
  return !error;
}

export async function marcarComissaoPaga(bd: ClienteBD, id: string, data: string) {
  const { error } = await bd.rpc("marcar_comissao_paga", { p_comissao: id, p_data: data });
  return !error;
}
