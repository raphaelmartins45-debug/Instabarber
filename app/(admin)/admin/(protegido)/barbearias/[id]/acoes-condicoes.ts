"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { definirCortesia, definirImplementacao } from "@/lib/repositorios/admin/barbearias";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  type DadosCortesia,
  type DadosImplementacao,
  esquemaCortesia,
  esquemaImplementacao,
} from "@/lib/validacao/condicoes-barbearia";

// Cortesia e implementação de uma barbearia (D-189). Só o super_admin com dois fatores; as funções
// SQL voltam a verificar e registam em auditoria.

type Resultado = { ok: true } | { ok: false; erro: string };
const id = z.guid();
const erroDe = (motivo: string) =>
  ["data_passada", "implementacao_paga", "implementacao_invalida"].find((e) =>
    motivo.includes(e),
  ) ?? "generico";

export async function guardarCortesia(
  inquilinoId: string,
  dados: DadosCortesia,
): Promise<Resultado> {
  await exigirSuperAdmin();
  const v = esquemaCortesia.safeParse(dados);
  if (!v.success || !id.safeParse(inquilinoId).success) return { ok: false, erro: "data" };
  const r = await definirCortesia(
    await criarClienteServidor(),
    inquilinoId,
    v.data.ativa,
    v.data.ate || null,
  );
  revalidatePath(`/admin/barbearias/${inquilinoId}`, "layout");
  return r.ok ? { ok: true } : { ok: false, erro: erroDe(r.motivo) };
}

export async function guardarImplementacao(
  inquilinoId: string,
  dados: DadosImplementacao,
): Promise<Resultado> {
  await exigirSuperAdmin();
  const v = esquemaImplementacao.safeParse(dados);
  if (!v.success || !id.safeParse(inquilinoId).success) return { ok: false, erro: "valor" };
  const r = await definirImplementacao(
    await criarClienteServidor(),
    inquilinoId,
    v.data.tipo,
    v.data.valor,
  );
  revalidatePath(`/admin/barbearias/${inquilinoId}`, "layout");
  return r.ok ? { ok: true } : { ok: false, erro: erroDe(r.motivo) };
}
