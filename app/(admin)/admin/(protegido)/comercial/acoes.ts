"use server";

import { revalidatePath } from "next/cache";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import {
  apagarLeadsInativos,
  atualizarLead,
  criarLead,
  mudarEstadoLead,
  registarEventoLead,
} from "@/lib/repositorios/comercial/leads";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  esquemaEstado,
  esquemaEvento,
  esquemaLead,
  type DadosEstado,
  type DadosEvento,
  type DadosLead,
} from "@/lib/validacao/comercial";

// Ações do Comercial (N.3). Só o super_admin com dois fatores; a base de dados confere outra vez.

type Resultado = { ok: true; id?: string } | { ok: false; erro: string };

const erroDe = (issues: { message: string }[]) => issues[0]?.message ?? "generico";

function revalidar(id?: string) {
  revalidatePath("/admin/comercial");
  revalidatePath("/admin/comercial/leads");
  if (id) revalidatePath(`/admin/comercial/leads/${id}`);
}

export async function criar(dados: DadosLead): Promise<Resultado> {
  const admin = await exigirSuperAdmin();
  const v = esquemaLead.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  const id = await criarLead(await criarClienteServidor(), v.data, admin.userId);
  if (!id) return { ok: false, erro: "generico" };
  revalidar();
  return { ok: true, id };
}

export async function atualizar(id: string, dados: DadosLead): Promise<Resultado> {
  await exigirSuperAdmin();
  const v = esquemaLead.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  if (!(await atualizarLead(await criarClienteServidor(), id, v.data)))
    return { ok: false, erro: "generico" };
  revalidar(id);
  return { ok: true };
}

export async function mudarEstado(id: string, dados: DadosEstado): Promise<Resultado> {
  await exigirSuperAdmin();
  const v = esquemaEstado.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  if (!(await mudarEstadoLead(await criarClienteServidor(), id, v.data)))
    return { ok: false, erro: "generico" };
  revalidar(id);
  return { ok: true };
}

export async function registarEvento(id: string, dados: DadosEvento): Promise<Resultado> {
  await exigirSuperAdmin();
  const v = esquemaEvento.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  if (!(await registarEventoLead(await criarClienteServidor(), id, v.data)))
    return { ok: false, erro: "generico" };
  revalidar(id);
  return { ok: true };
}

export async function apagarInativos(): Promise<
  { ok: true; n: number } | { ok: false; erro: string }
> {
  await exigirSuperAdmin();
  const n = await apagarLeadsInativos(await criarClienteServidor());
  revalidar();
  return n === null ? { ok: false, erro: "generico" } : { ok: true, n };
}
