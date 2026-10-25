import { CONDICOES_DESLIGADAS, type CondicoesComerciais } from "@/lib/comercial/condicoes";
import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Condições comerciais (D-161): uma só linha. Os administradores alteram; o comercial lê.

export async function lerCondicoes(bd: ClienteBD): Promise<CondicoesComerciais> {
  const { data, error } = await bd.from("configuracao_comercial").select("*").maybeSingle();
  if (error) falhaDeLeitura("configuracao_comercial", error);
  if (!data) return CONDICOES_DESLIGADAS;
  return {
    descontosAtivos: data.descontos_ativos,
    descontoMaxMensalidade: Number(data.desconto_max_mensalidade_pct),
    taxaAtiva: data.taxa_migracao_ativa,
    taxaBaseCent: centimosDeNumeric(data.taxa_migracao_sem_iva),
    descontoMaxTaxa: Number(data.desconto_max_taxa_pct),
  };
}

export async function guardarCondicoes(
  bd: ClienteBD,
  c: CondicoesComerciais,
  autor: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("configuracao_comercial")
    .update({
      descontos_ativos: c.descontosAtivos,
      desconto_max_mensalidade_pct: c.descontoMaxMensalidade,
      taxa_migracao_ativa: c.taxaAtiva,
      taxa_migracao_sem_iva: numericParaGravar(c.taxaBaseCent),
      desconto_max_taxa_pct: c.descontoMaxTaxa,
      atualizado_por: autor,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", true)
    .select("id");
  return !error && data.length === 1;
}
