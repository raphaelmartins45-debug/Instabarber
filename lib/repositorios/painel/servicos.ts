import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Serviços da barbearia. A equipa lê; só o gestor escreve (RLS servicos_*).

export type Servico = {
  id: string;
  nome: string;
  nomeEn: string | null;
  nomeFr: string | null;
  descricao: string | null;
  descricaoEn: string | null;
  descricaoFr: string | null;
  duracaoMin: number;
  precoCent: number;
  ativo: boolean;
  ordem: number;
};

export async function listarServicos(
  bd: ClienteBD,
  inquilinoId: string,
  soAtivos = true,
): Promise<Servico[]> {
  let q = bd
    .from("servicos")
    .select(
      "id, nome, nome_en, nome_fr, descricao, descricao_en, descricao_fr, duracao_min, preco, ativo, ordem",
    )
    .eq("inquilino_id", inquilinoId)
    .order("ordem")
    .order("nome");
  if (soAtivos) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) falhaDeLeitura("servicos", error);
  return data.map((s) => ({
    id: s.id,
    nome: s.nome,
    nomeEn: s.nome_en,
    nomeFr: s.nome_fr,
    descricao: s.descricao,
    descricaoEn: s.descricao_en,
    descricaoFr: s.descricao_fr,
    duracaoMin: s.duracao_min,
    precoCent: centimosDeNumeric(s.preco),
    ativo: s.ativo,
    ordem: s.ordem,
  }));
}

export type DadosServico = {
  nome: string;
  nomeEn: string | null;
  nomeFr: string | null;
  descricao: string | null;
  descricaoEn: string | null;
  descricaoFr: string | null;
  duracaoMin: number;
  precoCent: number;
  ativo: boolean;
};

const paraLinha = (d: DadosServico) => ({
  nome: d.nome,
  nome_en: d.nomeEn,
  nome_fr: d.nomeFr,
  descricao: d.descricao,
  descricao_en: d.descricaoEn,
  descricao_fr: d.descricaoFr,
  duracao_min: d.duracaoMin,
  preco: numericParaGravar(d.precoCent),
  ativo: d.ativo,
});

export async function gravarServico(
  bd: ClienteBD,
  inquilinoId: string,
  id: string | null,
  dados: DadosServico,
): Promise<boolean> {
  const { error } = id
    ? await bd
        .from("servicos")
        .update(paraLinha(dados))
        .eq("inquilino_id", inquilinoId)
        .eq("id", id)
    : await bd.from("servicos").insert({ ...paraLinha(dados), inquilino_id: inquilinoId });
  return !error;
}
