"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { alterarCampanha } from "@/lib/repositorios/comercial/campanhas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { type DadosCampanha, esquemaCampanha } from "@/lib/validacao/campanhas";

// Campanhas comerciais (D-190): só os administradores (dono e gestor); o RLS volta a verificar.

export async function guardarCampanha(
  id: string,
  dados: DadosCampanha,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  await exigirSuperAdmin();
  const v = esquemaCampanha.safeParse(dados);
  if (!v.success || !z.guid().safeParse(id).success)
    return { ok: false, erro: v.error?.issues[0]?.message ?? "generico" };
  const ok = await alterarCampanha(await criarClienteServidor(), id, {
    ativa: v.data.ativa,
    nome: v.data.nome,
    texto: v.data.texto,
    valida_ate: v.data.valida_ate || null,
    vagas: v.data.vagas ? Number(v.data.vagas) : null,
  });
  revalidatePath("/admin/comercial", "layout");
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}
