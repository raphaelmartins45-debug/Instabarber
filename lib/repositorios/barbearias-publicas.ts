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

export type ProfissionalPublico = {
  id: string;
  nome: string;
  fotoUrl: string | null;
  portfolio: string[];
};

/** A equipa ativa e, quando visível, o portfólio de cada um (F.4.6). */
export async function listarEquipaPublica(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<ProfissionalPublico[]> {
  const [equipa, fotos] = await Promise.all([
    bd
      .from("publico_profissionais")
      .select("id, nome_apresentado, foto_url, ordem")
      .eq("inquilino_id", inquilinoId)
      .order("ordem"),
    bd
      .from("publico_portfolio")
      .select("profissional_id, foto_url, ordem")
      .eq("inquilino_id", inquilinoId)
      .order("ordem"),
  ]);
  if (equipa.error) falhaDeLeitura("publico_profissionais", equipa.error);
  if (fotos.error) falhaDeLeitura("publico_portfolio", fotos.error);
  return equipa.data.flatMap((p) =>
    p.id && p.nome_apresentado
      ? [
          {
            id: p.id,
            nome: p.nome_apresentado,
            fotoUrl: p.foto_url,
            portfolio: fotos.data
              .filter((f) => f.profissional_id === p.id && f.foto_url)
              .map((f) => f.foto_url!),
          },
        ]
      : [],
  );
}

export type ProdutoPublico = {
  id: string;
  nome: string;
  descricao: string | null;
  fotoUrl: string | null;
  precoCent: number;
  esgotado: boolean;
};

export async function listarProdutosPublicos(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<ProdutoPublico[]> {
  const { data, error } = await bd
    .from("publico_produtos")
    .select("*")
    .eq("inquilino_id", inquilinoId)
    .order("nome");
  if (error) falhaDeLeitura("publico_produtos", error);
  return data.flatMap((p) =>
    p.id && p.nome && p.preco_venda !== null
      ? [
          {
            id: p.id,
            nome: p.nome,
            descricao: p.descricao,
            fotoUrl: p.foto_url,
            precoCent: centimosDeNumeric(p.preco_venda),
            esgotado: !!p.esgotado,
          },
        ]
      : [],
  );
}

export type PromocaoPublica = { id: string; titulo: string; descricao: string | null };

export async function listarPromocoesPublicas(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<PromocaoPublica[]> {
  const { data, error } = await bd
    .from("publico_promocoes")
    .select("id, titulo, descricao")
    .eq("inquilino_id", inquilinoId);
  if (error) falhaDeLeitura("publico_promocoes", error);
  return data.flatMap((p) =>
    p.id && p.titulo ? [{ id: p.id, titulo: p.titulo, descricao: p.descricao }] : [],
  );
}
