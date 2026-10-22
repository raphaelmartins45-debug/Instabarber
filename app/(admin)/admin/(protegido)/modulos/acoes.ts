"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { chavesEmFalta } from "@/lib/pagamentos/configuracao";
import { alternarModuloBarbearia, alternarModuloGeral } from "@/lib/repositorios/admin/modulos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Interruptores dos módulos (G.4): só o super_admin, com dois fatores. O geral não liga sem as
// chaves do fornecedor. Os gatilhos da base de dados põem cada alteração em auditoria.

const chave = z.enum(["pagamentos", "faturacao"]);

export async function interruptorGeral(
  modulo: string,
  ativo: boolean,
): Promise<{ ok: boolean; emFalta?: string[] }> {
  const admin = await exigirSuperAdmin();
  const c = chave.safeParse(modulo);
  if (!c.success) return { ok: false };
  const emFalta = chavesEmFalta(c.data);
  if (ativo && emFalta.length) return { ok: false, emFalta };
  const ok = await alternarModuloGeral(await criarClienteServidor(), c.data, ativo, admin.userId);
  revalidatePath("/admin/modulos");
  return { ok };
}

export async function interruptorBarbearia(
  inquilinoId: string,
  modulo: string,
  ativo: boolean,
): Promise<{ ok: boolean }> {
  const admin = await exigirSuperAdmin();
  const c = chave.safeParse(modulo);
  if (!c.success || !z.string().uuid().safeParse(inquilinoId).success) return { ok: false };
  const ok = await alternarModuloBarbearia(
    await criarClienteServidor(),
    inquilinoId,
    c.data,
    ativo,
    admin.userId,
  );
  revalidatePath("/admin/modulos");
  return { ok };
}
