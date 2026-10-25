"use server";

import { revalidatePath } from "next/cache";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { apagarAuditoriaAntiga } from "@/lib/repositorios/admin/auditoria";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Retenção da auditoria (D-157): rotina mensal à mão; a base de dados confere o super_admin e o prazo.

export async function apagarAuditoria(): Promise<{ ok: true; n: number } | { ok: false }> {
  await exigirSuperAdmin();
  const n = await apagarAuditoriaAntiga(await criarClienteServidor());
  revalidatePath("/admin");
  return n === null ? { ok: false } : { ok: true, n };
}
