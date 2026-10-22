import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";

// Profissionais da barbearia. O gestor cria e altera (RLS); o limite de profissionais
// ativos é da base de dados (gatilho limite_profissionais).

export type MembroEquipa = {
  id: string;
  nome: string;
  nome_apresentado: string;
  email: string | null;
  perfil_id: string | null;
  ativo: boolean;
  criado_em: string;
};

const COLUNAS = "id, nome, nome_apresentado, email, perfil_id, ativo, criado_em";

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
