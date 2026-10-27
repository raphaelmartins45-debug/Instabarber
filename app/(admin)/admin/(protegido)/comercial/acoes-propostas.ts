"use server";

import { eAdministrador } from "@/lib/admin/acesso";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { type DadosBriefing, esquemaBriefing } from "@/lib/comercial/briefing";
import { codigoErro, gerarPropostaDoLead } from "@/lib/comercial/gerar-proposta";
import {
  decidirProposta,
  guardarBriefing,
  marcarPropostaEnviada,
} from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Briefing e propostas (N.4, N.5). Os preços vêm da fórmula única (D.7) e a base de dados
// confere-os; depois de enviada, a proposta não muda (gatilho).

type Resultado = { ok: true; id?: string } | { ok: false; erro: string; campos?: string[] };

const uuid = z.string().uuid();

function revalidar(leadId: string) {
  revalidatePath(`/admin/comercial/leads/${leadId}`);
  revalidatePath("/admin/comercial/propostas");
  revalidatePath("/admin/comercial");
  revalidatePath("/admin/documentos");
}

export async function guardar(leadId: string, dados: DadosBriefing): Promise<Resultado> {
  const admin = await exigirEquipaPlataforma();
  const v = esquemaBriefing.safeParse(dados);
  if (!uuid.safeParse(leadId).success || !v.success) return { ok: false, erro: "generico" };
  if (!(await guardarBriefing(await criarClienteServidor(), leadId, v.data, admin.userId)))
    return { ok: false, erro: "generico" };
  revalidar(leadId);
  return { ok: true };
}

/** Gera uma versão nova da proposta a partir do briefing guardado. */
export async function gerar(leadId: string): Promise<Resultado> {
  const quem = await exigirEquipaPlataforma();
  if (!uuid.safeParse(leadId).success) return { ok: false, erro: "generico" };
  const r = await gerarPropostaDoLead(
    await criarClienteServidor(),
    leadId,
    eAdministrador(quem.papel),
  );
  if (r.ok) revalidar(leadId);
  return r;
}

export async function marcarEnviada(leadId: string, propostaId: string): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const erro = await marcarPropostaEnviada(await criarClienteServidor(), propostaId);
  if (erro) return { ok: false, erro: codigoErro(erro) };
  revalidar(leadId);
  return { ok: true };
}

export async function decidir(
  leadId: string,
  propostaId: string,
  aceite: boolean,
  motivo?: string,
): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const m = z.string().trim().max(400).optional().safeParse(motivo);
  if (!m.success || (!aceite && !m.data)) return { ok: false, erro: "motivo" };
  const erro = await decidirProposta(await criarClienteServidor(), propostaId, aceite, m.data);
  if (erro) return { ok: false, erro: codigoErro(erro) };
  revalidar(leadId);
  return { ok: true };
}
