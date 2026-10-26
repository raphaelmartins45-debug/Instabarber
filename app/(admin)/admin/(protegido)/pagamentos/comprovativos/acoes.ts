"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { responderBarbearia } from "@/lib/admin/comprovativos";
import {
  aprovarComprovativo,
  obterComprovativo,
  recusarComprovativo,
} from "@/lib/repositorios/comprovativos";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// A Performa LAB decide um comprovativo (D-168). A função SQL faz tudo o que se grava; aqui só se
// responde à barbearia por e-mail e se atualizam os ecrãs.

type Resultado = { ok: true; email: boolean } | { ok: false; erro: string };

async function depois(id: string): Promise<boolean> {
  const bd = await criarClienteServidor();
  const c = await obterComprovativo(bd, id);
  if (!c) return false;
  const email = await responderBarbearia(await obterConfiguracao(bd, c.inquilino_id), c);
  revalidatePath("/admin");
  revalidatePath("/admin/pagamentos");
  revalidatePath(`/admin/pagamentos/comprovativos/${id}`);
  revalidatePath(`/admin/barbearias/${c.inquilino_id}/pagamentos`);
  return email;
}

export async function aprovar(id: string): Promise<Resultado> {
  await exigirSuperAdmin();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, erro: "generico" };
  const r = await aprovarComprovativo(await criarClienteServidor(), id);
  if (!r.ok) return { ok: false, erro: r.erro };
  return { ok: true, email: await depois(id) };
}

export async function recusar(id: string, motivo: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const m = z.string().trim().min(3).max(600).safeParse(motivo);
  if (!z.string().uuid().safeParse(id).success) return { ok: false, erro: "generico" };
  if (!m.success) return { ok: false, erro: "motivo" };
  const r = await recusarComprovativo(await criarClienteServidor(), id, m.data);
  if (!r.ok) return { ok: false, erro: r.erro };
  return { ok: true, email: await depois(id) };
}
