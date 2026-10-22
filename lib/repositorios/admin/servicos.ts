import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Serviços de uma barbearia: o gestor e o super_admin escrevem (RLS servicos_escrever).

export type ServicoAdmin = {
  id: string;
  nome: string;
  duracao_min: number;
  preco_centimos: number;
  ativo: boolean;
};

export async function listarServicosAdmin(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<ServicoAdmin[]> {
  const { data, error } = await bd
    .from("servicos")
    .select("id, nome, duracao_min, preco, ativo")
    .eq("inquilino_id", inquilinoId)
    .order("ordem")
    .order("nome");
  if (error) falhaDeLeitura("servicos", error);
  return data.map(({ preco, ...s }) => ({ ...s, preco_centimos: centimosDeNumeric(preco) }));
}

export type NovoServico = { nome: string; duracao_min: number; preco_centimos: number };

export async function criarServicos(
  bd: ClienteBD,
  inquilinoId: string,
  servicos: NovoServico[],
): Promise<boolean> {
  if (servicos.length === 0) return true;
  const { error } = await bd.from("servicos").insert(
    servicos.map((s, i) => ({
      inquilino_id: inquilinoId,
      nome: s.nome,
      duracao_min: s.duracao_min,
      preco: numericParaGravar(s.preco_centimos),
      ordem: i,
    })),
  );
  return !error;
}

export async function alterarServico(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
  campos: Partial<NovoServico> & { ativo?: boolean },
): Promise<boolean> {
  const { preco_centimos, ...resto } = campos;
  const { error } = await bd
    .from("servicos")
    .update({
      ...resto,
      ...(preco_centimos !== undefined ? { preco: numericParaGravar(preco_centimos) } : {}),
    })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id);
  return !error;
}
