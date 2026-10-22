import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "./erros";

// Profissionais da barbearia. O gestor cria e altera (RLS); o limite de profissionais
// ativos é da base de dados (gatilho limite_profissionais).

export type MembroEquipa = {
  id: string;
  nome: string;
  nome_apresentado: string;
  email: string | null;
  perfil_id: string | null;
  foto_url: string | null;
  ativo: boolean;
  criado_em: string;
};

const COLUNAS = "id, nome, nome_apresentado, email, perfil_id, foto_url, ativo, criado_em";

export async function listarEquipa(bd: ClienteBD, inquilinoId: string): Promise<MembroEquipa[]> {
  const { data, error } = await bd
    .from("profissionais")
    .select(COLUNAS)
    .eq("inquilino_id", inquilinoId)
    .order("ordem")
    .order("nome");
  if (error) falhaDeLeitura("profissionais", error);
  return data;
}

export async function obterProfissional(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<MembroEquipa | null> {
  const { data, error } = await bd
    .from("profissionais")
    .select(COLUNAS)
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .maybeSingle();
  if (error) falhaDeLeitura("profissionais", error);
  return data;
}

/** O registo de profissional ligado a um perfil (o barbeiro na barbearia onde está). */
export async function obterProfissionalDoPerfil(
  bd: ClienteBD,
  perfilId: string,
): Promise<string | null> {
  const { data, error } = await bd
    .from("profissionais")
    .select("id")
    .eq("perfil_id", perfilId)
    .eq("ativo", true)
    .maybeSingle();
  if (error) falhaDeLeitura("profissionais", error);
  return data?.id ?? null;
}

export type ResultadoEscrita = { ok: true; id: string } | { ok: false; motivo: string };

/** Cria o profissional. Recusa com o motivo da base de dados (ex.: limite_profissionais). */
export async function criarProfissional(
  bd: ClienteBD,
  dados: { inquilinoId: string; nome: string; email: string; nif: string | null },
): Promise<ResultadoEscrita> {
  const { data, error } = await bd
    .from("profissionais")
    .insert({
      inquilino_id: dados.inquilinoId,
      nome: dados.nome,
      nome_apresentado: dados.nome.split(/\s+/)[0] ?? dados.nome,
      email: dados.email,
      nif: dados.nif,
    })
    .select("id")
    .single();
  if (error) return { ok: false, motivo: error.message };
  return { ok: true, id: data.id };
}

export async function ligarPerfilAoProfissional(
  bd: ClienteBD,
  profissionalId: string,
  perfilId: string,
): Promise<void> {
  const { error } = await bd
    .from("profissionais")
    .update({ perfil_id: perfilId })
    .eq("id", profissionalId);
  if (error) throw new Error(`Escrita falhou (profissionais): ${error.message}`);
}

/** Desfaz um registo que ficou a meio (convite falhado). Só a chave de serviço apaga. */
export async function apagarProfissionalSemHistorico(bd: ClienteBD, id: string): Promise<void> {
  const { error } = await bd.from("profissionais").delete().eq("id", id).is("perfil_id", null);
  if (error) throw new Error(`Escrita falhou (profissionais): ${error.message}`);
}

export type FichaProfissional = MembroEquipa & {
  nif: string | null;
  comissao_percent: number;
  modelo_caixa: "A" | "B" | "C";
  renda_valor: number | null;
  renda_dia_vencimento: number | null;
  portfolio_visivel: boolean;
};

const COLUNAS_FICHA = `${COLUNAS}, nif, comissao_percent, modelo_caixa, renda_valor, renda_dia_vencimento, portfolio_visivel`;

/** A equipa com os dados da ficha (comissão, modelo de caixa, renda), para o gestor e os acertos. */
export async function listarFichasEquipa(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<FichaProfissional[]> {
  const { data, error } = await bd
    .from("profissionais")
    .select(COLUNAS_FICHA)
    .eq("inquilino_id", inquilinoId)
    .order("ordem")
    .order("nome");
  if (error) falhaDeLeitura("profissionais", error);
  return data.map((p) => ({
    ...p,
    modelo_caixa: p.modelo_caixa as FichaProfissional["modelo_caixa"],
  }));
}

/** Alteração da ficha. O gatilho proteger_profissional limita o que o próprio barbeiro muda (B3). */
export async function alterarProfissional(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
  alteracao: Database["public"]["Tables"]["profissionais"]["Update"],
): Promise<ResultadoEscrita> {
  const { error } = await bd
    .from("profissionais")
    .update(alteracao)
    .eq("inquilino_id", inquilinoId)
    .eq("id", id);
  return error ? { ok: false, motivo: error.message } : { ok: true, id };
}

/** Percentagens por serviço de um profissional (sem linha, vale a de omissão). */
export async function listarComissoesServico(
  bd: ClienteBD,
  profissionalId: string,
): Promise<Map<string, number>> {
  const { data, error } = await bd
    .from("comissoes_servico")
    .select("servico_id, percentagem")
    .eq("profissional_id", profissionalId);
  if (error) falhaDeLeitura("comissoes_servico", error);
  return new Map(data.map((c) => [c.servico_id, Number(c.percentagem)]));
}

/** Substitui as percentagens por serviço (os serviços sem valor voltam à de omissão). */
export async function gravarComissoesServico(
  bd: ClienteBD,
  inquilinoId: string,
  profissionalId: string,
  porServico: { servicoId: string; percentagem: number }[],
): Promise<boolean> {
  const apagar = await bd.from("comissoes_servico").delete().eq("profissional_id", profissionalId);
  if (apagar.error) return false;
  if (porServico.length === 0) return true;
  const { error } = await bd.from("comissoes_servico").insert(
    porServico.map((c) => ({
      inquilino_id: inquilinoId,
      profissional_id: profissionalId,
      servico_id: c.servicoId,
      percentagem: c.percentagem,
    })),
  );
  return !error;
}
