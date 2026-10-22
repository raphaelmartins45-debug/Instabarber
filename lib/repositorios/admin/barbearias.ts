import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "../erros";

// Barbearias vistas pelo super_admin com dois fatores (RLS: *_admin_ler, inquilinos_*).

export type Barbearia = Database["public"]["Tables"]["inquilinos"]["Row"];
export type AlteracaoBarbearia = Database["public"]["Tables"]["inquilinos"]["Update"];
export type NovaBarbearia = Database["public"]["Tables"]["inquilinos"]["Insert"];

export type FiltrosBarbearias = {
  pesquisa?: string;
  estado?: string;
  plano?: string;
  periodicidade?: string;
};

export type LinhaBarbearia = Pick<
  Barbearia,
  | "id"
  | "nome"
  | "slug"
  | "plano"
  | "periodicidade"
  | "estado"
  | "estado_pagamento"
  | "proximo_vencimento"
  | "profissionais_contratados"
  | "dominio_proprio"
  | "aprovado_em"
> & { funcionalidades_ativas: number };

const COLUNAS =
  "id, nome, slug, plano, periodicidade, estado, estado_pagamento, proximo_vencimento, profissionais_contratados, dominio_proprio, aprovado_em, inquilino_funcionalidades(count)";

export async function listarBarbearias(
  bd: ClienteBD,
  f: FiltrosBarbearias = {},
): Promise<LinhaBarbearia[]> {
  let q = bd
    .from("inquilinos")
    .select(COLUNAS)
    .eq("inquilino_funcionalidades.ativa", true)
    .order("nome");
  if (f.estado) q = q.eq("estado", f.estado);
  if (f.plano) q = q.eq("plano", f.plano);
  if (f.periodicidade) q = q.eq("periodicidade", f.periodicidade);
  if (f.pesquisa) {
    const termo = f.pesquisa.replace(/[%,()*]/g, " ").trim();
    if (termo)
      q = q.or(`nome.ilike.%${termo}%,slug.ilike.%${termo}%,dominio_proprio.ilike.%${termo}%`);
  }
  const { data, error } = await q;
  if (error) falhaDeLeitura("inquilinos", error);
  return data.map(({ inquilino_funcionalidades, ...b }) => ({
    ...b,
    funcionalidades_ativas:
      (inquilino_funcionalidades as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

export async function obterBarbearia(bd: ClienteBD, id: string): Promise<Barbearia | null> {
  const { data, error } = await bd.from("inquilinos").select("*").eq("id", id).maybeSingle();
  if (error) falhaDeLeitura("inquilinos", error);
  return data;
}

export type ResultadoAlteracao = { ok: true } | { ok: false; motivo: string };

export async function alterarBarbearia(
  bd: ClienteBD,
  id: string,
  campos: AlteracaoBarbearia,
): Promise<ResultadoAlteracao> {
  const { error } = await bd.from("inquilinos").update(campos).eq("id", id);
  return error ? { ok: false, motivo: `${error.code ?? ""} ${error.message}` } : { ok: true };
}

export async function criarBarbearia(
  bd: ClienteBD,
  dados: NovaBarbearia,
): Promise<{ ok: true; id: string } | { ok: false; motivo: string }> {
  const { data, error } = await bd.from("inquilinos").insert(dados).select("id").single();
  return error
    ? { ok: false, motivo: `${error.code ?? ""} ${error.message}` }
    : { ok: true, id: data.id };
}

/** Desfaz uma barbearia acabada de criar numa aprovação que falhou (o super_admin apaga). */
export async function apagarBarbeariaNova(bd: ClienteBD, id: string): Promise<void> {
  await bd.from("inquilinos").delete().eq("id", id).is("aprovado_em", null);
}

/** Os slugs já usados que começam por um prefixo (para gerar um livre). */
export async function slugsComPrefixo(bd: ClienteBD, prefixo: string): Promise<string[]> {
  const { data, error } = await bd.from("inquilinos").select("slug").like("slug", `${prefixo}%`);
  if (error) falhaDeLeitura("inquilinos", error);
  return data.map((l) => l.slug);
}

export async function aplicarPacote(bd: ClienteBD, id: string): Promise<boolean> {
  const { error } = await bd.rpc("aplicar_pacote", { p_inquilino: id });
  return !error;
}

/** Elimina uma barbearia cancelada; devolve as contas de autenticação que ficam sem uso. */
export async function eliminarBarbearia(
  bd: ClienteBD,
  id: string,
  confirmacao: string,
): Promise<{ ok: true; contas: string[] } | { ok: false; motivo: string }> {
  const { data, error } = await bd.rpc("eliminar_inquilino", {
    p_inquilino: id,
    p_confirmacao: confirmacao,
  });
  if (error) return { ok: false, motivo: error.message };
  return { ok: true, contas: (data ?? []).map((l: { user_id: string }) => l.user_id) };
}
