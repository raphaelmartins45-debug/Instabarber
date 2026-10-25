"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { instanteLocal, somarDias } from "@/lib/formatacao/datas";
import {
  apagarComunicado,
  criarComunicado,
  terminarComunicado,
} from "@/lib/repositorios/admin/comunicados";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { type DadosComunicado, esquemaComunicado } from "@/lib/validacao/gestao";

// Comunicados aos gestores (D-160). Só o super_admin com dois fatores; o RLS volta a verificar.

type Resultado = { ok: true } | { ok: false; erro: string };
const uuid = z.string().uuid();

export async function publicarComunicado(dados: DadosComunicado): Promise<Resultado> {
  const { userId } = await exigirSuperAdmin();
  const v = esquemaComunicado.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "generico" };
  const c = v.data;
  // As datas são dias de Lisboa: mostra-se do início do primeiro dia ao fim do último.
  const ok = await criarComunicado(await criarClienteServidor(), {
    titulo: c.titulo,
    texto: c.texto,
    destino: c.destino,
    plano: c.destino === "plano" ? c.plano : null,
    inquilinoId: c.destino === "barbearia" ? c.inquilino_id : null,
    inicio: instanteLocal(c.inicio, "00:00").toISOString(),
    fim: c.fim ? instanteLocal(somarDias(c.fim, 1), "00:00").toISOString() : null,
    autor: userId,
  });
  revalidatePath("/admin/comunicados");
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}

export async function terminar(id: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const ok = await terminarComunicado(await criarClienteServidor(), uuid.parse(id));
  revalidatePath("/admin/comunicados");
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}

export async function apagar(id: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const ok = await apagarComunicado(await criarClienteServidor(), uuid.parse(id));
  revalidatePath("/admin/comunicados");
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}
