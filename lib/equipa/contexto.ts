import "server-only";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { entradaEquipaAqui, lerEndereco } from "@/lib/inquilino/endereco";
import { listarMeusPerfis, type MeuPerfil } from "@/lib/repositorios/perfis";
import { obterProfissionalDoPerfil } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { eAdministrador, ePapelPlataforma } from "@/lib/admin/acesso";
import { COOKIE_APOIO, lerApoio } from "@/lib/admin/apoio";
import { obterBarbearia } from "@/lib/repositorios/admin/barbearias";

// Quem está no painel da barbearia (camadas 2 e 3) e em que barbearia. O RLS volta a
// verificar tudo; isto decide o que se mostra e para onde se encaminha (B.6).

export const COOKIE_BARBEARIA = "ib_barbearia";

export type BarbeariaDaEquipa = { id: string; nome: string; slug: string };

export type ContextoEquipa = {
  userId: string;
  barbearia: BarbeariaDaEquipa;
  eGestor: boolean;
  /** O registo de profissional do utilizador nesta barbearia, se trabalhar nela. */
  profissionalId: string | null;
  /** Barbearias onde o utilizador tem perfil (para a troca). */
  barbearias: BarbeariaDaEquipa[];
  /** Vista de apoio do super_admin (só leitura, E.1): até quando vale. */
  apoio: { expira: string } | null;
};

export const obterContextoEquipa = cache(async (): Promise<ContextoEquipa> => {
  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  const { slug } = await lerEndereco();
  const entrada = await entradaEquipaAqui();
  if (!user) redirect(entrada);

  const perfis = await listarMeusPerfis(bd, user.id);
  const daEquipa = perfis.filter(
    (p): p is MeuPerfil & { inquilino: NonNullable<MeuPerfil["inquilino"]> } =>
      !ePapelPlataforma(p.papel) && p.inquilino?.estado === "ativo",
  );
  if (daEquipa.length === 0) {
    // Barbearia suspensa (M.4): o gestor só vê o plano e as faturas, para regularizar.
    if (perfis.some((p) => p.papel === "proprietario" && p.inquilino?.estado === "suspenso"))
      redirect("/app/suspensa");
    // O dono e o gestor abrem a vista de apoio; o comercial não (D-161).
    if (perfis.some((p) => ePapelPlataforma(p.papel) && eAdministrador(p.papel))) {
      const apoio = await contextoDeApoio(bd, user.id);
      if (apoio) return apoio;
      redirect("/admin");
    }
    redirect(`${entrada}?erro=sem_acesso`);
  }

  const barbearias = unicas(daEquipa.map((p) => p.inquilino));
  const escolhida = (await cookies()).get(COOKIE_BARBEARIA)?.value;

  let barbearia: BarbeariaDaEquipa | undefined;
  if (slug) {
    // No endereço de uma barbearia, o painel é o dessa barbearia, ou nenhum.
    barbearia = barbearias.find((b) => b.slug === slug);
    if (!barbearia) notFound();
  } else {
    barbearia =
      barbearias.find((b) => b.id === escolhida) ??
      (barbearias.length === 1 ? barbearias[0] : undefined);
    if (!barbearia) redirect("/app/escolher");
  }

  const aqui = daEquipa.filter((p) => p.inquilino.id === barbearia.id);
  const perfilProfissional = aqui.find((p) => p.papel === "profissional");
  return {
    userId: user.id,
    barbearia,
    eGestor: aqui.some((p) => p.papel === "proprietario"),
    profissionalId: perfilProfissional
      ? await obterProfissionalDoPerfil(bd, perfilProfissional.id)
      : null,
    barbearias,
    apoio: null,
  };
});

/**
 * Vista de apoio: o super_admin com dois fatores e um apoio em curso vê o painel da barbearia
 * como o gestor, só para ler. A leitura é do RLS (*_admin_ler); a escrita é recusada.
 */
async function contextoDeApoio(bd: ClienteBD, userId: string): Promise<ContextoEquipa | null> {
  const apoio = lerApoio((await cookies()).get(COOKIE_APOIO)?.value);
  if (!apoio) return null;
  const { data } = await bd.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.currentLevel !== "aal2") return null;
  const b = await obterBarbearia(bd, apoio.inquilino);
  if (!b) return null;
  const barbearia = { id: b.id, nome: b.nome, slug: b.slug };
  return {
    userId,
    barbearia,
    eGestor: true,
    profissionalId: null,
    barbearias: [barbearia],
    apoio: { expira: apoio.expira },
  };
}

/** Para as ações que gravam: a vista de apoio é só de leitura. */
export async function exigirGestorParaEscrever(): Promise<ContextoEquipa> {
  const contexto = await exigirGestor();
  if (contexto.apoio) await recusarNoApoio();
  return contexto;
}

/**
 * Na vista de apoio nada se grava. Em vez de rebentar a página, volta ao ecrã de onde se veio
 * com `?so_leitura=1`, e a faixa explica que nada foi gravado (D-166).
 */
export async function recusarNoApoio(): Promise<never> {
  let destino = new URL("/app", "http://local");
  try {
    const origem = new URL((await headers()).get("referer") ?? "");
    if (origem.pathname.startsWith("/app"))
      destino = new URL(origem.pathname + origem.search, "http://local");
  } catch {
    // Sem referer válido: fica o Início do painel.
  }
  destino.searchParams.set("so_leitura", "1");
  redirect(destino.pathname + destino.search);
}

/** Só o gestor (Gestão do sistema, Início do gestor). O barbeiro vai para a sua área. */
export async function exigirGestor(): Promise<ContextoEquipa> {
  const contexto = await obterContextoEquipa();
  if (contexto.eGestor) return contexto;
  if (contexto.profissionalId) redirect(`/app/equipa/${contexto.profissionalId}`);
  notFound();
}

function unicas(lista: { id: string; nome: string; slug: string }[]): BarbeariaDaEquipa[] {
  const vistas = new Map<string, BarbeariaDaEquipa>();
  lista.forEach(({ id, nome, slug }) => vistas.set(id, { id, nome, slug }));
  return [...vistas.values()];
}

/** Ações da equipa (gestor ou barbeiro) que gravam; o RLS limita o barbeiro ao que é dele. */
export async function exigirEquipaParaEscrever(): Promise<ContextoEquipa> {
  const contexto = await obterContextoEquipa();
  if (contexto.apoio) await recusarNoApoio();
  if (!contexto.eGestor && !contexto.profissionalId) notFound();
  return contexto;
}
