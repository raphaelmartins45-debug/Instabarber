import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "./erros";

// Leitura pública de uma barbearia: só pelas vistas publico_* (C.4), que já filtram
// barbearias ativas, colunas seguras e funcionalidades ligadas.

type Vistas = Database["public"]["Views"];
export type BarbeariaPublica = Vistas["publico_inquilinos"]["Row"];
type LinhaServico = Vistas["publico_servicos"]["Row"];
export type ServicoPublico = Omit<LinhaServico, "preco"> & { preco_centimos: number };

/** A barbearia ativa com este slug, ou nulo se não existir ou não estiver ativa. */
export async function obterBarbeariaPublica(
  bd: ClienteBD,
  slug: string,
): Promise<BarbeariaPublica | null> {
  const { data, error } = await bd
    .from("publico_inquilinos")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) falhaDeLeitura("publico_inquilinos", error);
  return data;
}

/** Os serviços ativos da barbearia, pela ordem definida pelo gestor. */
export async function listarServicosPublicos(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<ServicoPublico[]> {
  const { data, error } = await bd
    .from("publico_servicos")
    .select("*")
    .eq("inquilino_id", inquilinoId)
    .order("ordem")
    .order("nome");
  if (error) falhaDeLeitura("publico_servicos", error);
  return data.map(servicoPublicoDeLinha);
}

/** O preço chega como numeric; no TypeScript vive em cêntimos inteiros (CLAUDE.md §5). */
export function servicoPublicoDeLinha({ preco, ...resto }: LinhaServico): ServicoPublico {
  if (preco === null) throw new Error(`Serviço sem preço: ${resto.id}`);
  return { ...resto, preco_centimos: centimosDeNumeric(preco) };
}
