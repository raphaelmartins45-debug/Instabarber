"use server";

import { revalidatePath } from "next/cache";
import { iniciarApoio } from "@/app/(admin)/admin/(protegido)/barbearias/[id]/acoes";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";
import { obterDemonstracao, prepararDemonstracao } from "@/lib/repositorios/admin/demonstracao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Barbearia de demonstração (D-162): o dono e o gestor preparam os dados de hoje e abrem o
// painel na vista de apoio (só leitura, 30 minutos, auditada).

export async function preparar(): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  const ok = !!(await prepararDemonstracao(await criarClienteServidor()));
  revalidatePath("/admin/comercial");
  return { ok };
}

export async function abrirPainel(): Promise<{ ok: boolean }> {
  await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const id = (await obterDemonstracao(bd))?.id ?? (await prepararDemonstracao(bd));
  if (!id) return { ok: false };
  return iniciarApoio(id, textos.comercial.demonstracao.justificacao);
}
