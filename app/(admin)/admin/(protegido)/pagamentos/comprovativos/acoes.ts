"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { responderBarbearia } from "@/lib/admin/comprovativos";
import { type EstadoFatura, faturarComprovativo } from "@/lib/faturacao-plataforma";
import {
  aprovarComprovativo,
  obterComprovativo,
  recusarComprovativo,
} from "@/lib/repositorios/comprovativos";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// A Performa LAB decide um comprovativo (D-168). A função SQL faz tudo o que se grava; aqui só se
// responde à barbearia por e-mail e se atualizam os ecrãs.

type Resultado = { ok: true; email: boolean; fatura?: EstadoFatura } | { ok: false; erro: string };

async function depois(
  id: string,
  faturar: boolean,
): Promise<{ email: boolean; fatura?: EstadoFatura }> {
  const bd = await criarClienteServidor();
  const c = await obterComprovativo(bd, id);
  if (!c) return { email: false };
  const b = await obterConfiguracao(bd, c.inquilino_id);
  // A fatura-recibo sai do programa certificado quando a faturação está ligada (D-170).
  const fatura = faturar ? await faturarComprovativo(bd, c, b) : undefined;
  const email = await responderBarbearia(b, c);
  revalidatePath("/admin");
  revalidatePath("/admin/pagamentos");
  revalidatePath(`/admin/pagamentos/comprovativos/${id}`);
  revalidatePath(`/admin/barbearias/${c.inquilino_id}/pagamentos`);
  return { email, fatura };
}

export async function aprovar(id: string): Promise<Resultado> {
  await exigirSuperAdmin();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, erro: "generico" };
  const r = await aprovarComprovativo(await criarClienteServidor(), id);
  if (!r.ok) return { ok: false, erro: r.erro };
  return { ok: true, ...(await depois(id, true)) };
}

export async function recusar(id: string, motivo: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const m = z.string().trim().min(3).max(600).safeParse(motivo);
  if (!z.string().uuid().safeParse(id).success) return { ok: false, erro: "generico" };
  if (!m.success) return { ok: false, erro: "motivo" };
  const r = await recusarComprovativo(await criarClienteServidor(), id, m.data);
  if (!r.ok) return { ok: false, erro: r.erro };
  return { ok: true, ...(await depois(id, false)) };
}
