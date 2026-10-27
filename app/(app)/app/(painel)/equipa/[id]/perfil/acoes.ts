"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaParaEscrever } from "@/lib/equipa/contexto";
import { carregarImagemPublica, removerImagemPublica } from "@/lib/repositorios/painel/imagens";
import { acrescentarFoto, removerFoto } from "@/lib/repositorios/painel/portfolio";
import { alterarProfissional, obterProfissional } from "@/lib/repositorios/profissionais";
import { entradaEquipaAqui } from "@/lib/inquilino/endereco";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Perfil do barbeiro (E.3.1): o próprio ou o gestor. O gatilho proteger_profissional deixa o
// barbeiro mudar só o nome apresentado, a fotografia e o «Tornar visível».

export type Resultado = { ok: true } | { ok: false; erro: string };

const uuid = z.string().uuid();

async function autorizar(profissionalId: string) {
  const contexto = await exigirEquipaParaEscrever();
  if (!uuid.safeParse(profissionalId).success) return null;
  if (!contexto.eGestor && contexto.profissionalId !== profissionalId) return null;
  return contexto;
}

function revalidar(id: string) {
  revalidatePath(`/app/equipa/${id}`, "layout");
}

export async function guardarPerfil(formulario: FormData): Promise<Resultado> {
  const id = String(formulario.get("profissionalId") ?? "");
  const contexto = await autorizar(id);
  if (!contexto) return { ok: false, erro: "erro" };
  const nome = String(formulario.get("nome") ?? "").trim();
  if (!nome || nome.length > 40) return { ok: false, erro: "nome" };
  const bd = await criarClienteServidor();
  const ficheiro = formulario.get("foto");
  let foto_url: string | undefined;
  if (ficheiro instanceof File && ficheiro.size > 0) {
    const url = await carregarImagemPublica(
      bd,
      `${contexto.barbearia.id}/portfolio/${id}`,
      ficheiro,
    );
    if (!url) return { ok: false, erro: "foto" };
    foto_url = url;
  }
  const antes = await obterProfissional(bd, contexto.barbearia.id, id);
  const r = await alterarProfissional(bd, contexto.barbearia.id, id, {
    nome_apresentado: nome,
    ...(foto_url ? { foto_url } : {}),
  });
  if (!r.ok) return { ok: false, erro: "erro" };
  if (foto_url && antes?.foto_url) await removerImagemPublica(bd, antes.foto_url);
  revalidar(id);
  return { ok: true };
}

export async function tornarVisivel(id: string, visivel: boolean): Promise<Resultado> {
  const contexto = await autorizar(id);
  if (!contexto) return { ok: false, erro: "erro" };
  const r = await alterarProfissional(await criarClienteServidor(), contexto.barbearia.id, id, {
    portfolio_visivel: visivel,
  });
  revalidar(id);
  return r.ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function acrescentarAoPortfolio(formulario: FormData): Promise<Resultado> {
  const id = String(formulario.get("profissionalId") ?? "");
  const contexto = await autorizar(id);
  if (!contexto) return { ok: false, erro: "erro" };
  const ficheiro = formulario.get("foto");
  if (
    !(ficheiro instanceof File) ||
    ficheiro.size === 0 ||
    !["image/jpeg", "image/webp"].includes(ficheiro.type)
  )
    return { ok: false, erro: "foto" };
  const bd = await criarClienteServidor();
  const url = await carregarImagemPublica(bd, `${contexto.barbearia.id}/portfolio/${id}`, ficheiro);
  if (!url) return { ok: false, erro: "foto" };
  const r = await acrescentarFoto(bd, contexto.barbearia.id, id, url);
  if (!r.ok) {
    await removerImagemPublica(bd, url);
    return { ok: false, erro: r.motivo };
  }
  revalidar(id);
  return { ok: true };
}

export async function removerDoPortfolio(
  profissionalId: string,
  fotoId: string,
): Promise<Resultado> {
  const contexto = await autorizar(profissionalId);
  if (!contexto || !uuid.safeParse(fotoId).success) return { ok: false, erro: "erro" };
  const bd = await criarClienteServidor();
  const url = await removerFoto(bd, fotoId);
  if (!url) return { ok: false, erro: "erro" };
  await removerImagemPublica(bd, url);
  revalidar(profissionalId);
  return { ok: true };
}

/** Terminar sessão em todos os dispositivos (E.3.1). */
export async function terminarSessoes(): Promise<{ destino: string }> {
  const bd = await criarClienteServidor();
  await bd.auth.signOut({ scope: "global" });
  return { destino: await entradaEquipaAqui("barbeiro") };
}
