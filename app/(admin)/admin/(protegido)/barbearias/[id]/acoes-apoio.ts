"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { criarApoio, mudarEstadoApoio } from "@/lib/repositorios/admin/apoio";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { type DadosApoio, esquemaApoio } from "@/lib/validacao/gestao";

// Registo de apoio (D-160). Só o super_admin com dois fatores; o RLS volta a verificar.

type Resultado = { ok: true } | { ok: false; erro: string };
const uuid = z.string().uuid();

function revalidar(inquilinoId: string) {
  revalidatePath(`/admin/barbearias/${inquilinoId}/apoio`);
  revalidatePath("/admin");
}

export async function registarApoio(inquilinoId: string, dados: DadosApoio): Promise<Resultado> {
  const { userId } = await exigirSuperAdmin();
  const v = esquemaApoio.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "generico" };
  const ok = await criarApoio(await criarClienteServidor(), {
    inquilinoId: uuid.parse(inquilinoId),
    ...v.data,
    autor: userId,
  });
  revalidar(inquilinoId);
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}

export async function resolverApoio(
  inquilinoId: string,
  id: string,
  resolvido: boolean,
): Promise<Resultado> {
  await exigirSuperAdmin();
  const ok = await mudarEstadoApoio(await criarClienteServidor(), uuid.parse(id), resolvido);
  revalidar(inquilinoId);
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}
