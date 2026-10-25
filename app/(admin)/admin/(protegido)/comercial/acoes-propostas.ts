"use server";

import { eAdministrador } from "@/lib/admin/acesso";
import { aplicarCondicoes } from "@/lib/comercial/condicoes";
import { lerCondicoes } from "@/lib/repositorios/comercial/condicoes";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { type DadosBriefing, emFaltaParaProposta, esquemaBriefing } from "@/lib/comercial/briefing";
import { montarProposta } from "@/lib/comercial/proposta";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import {
  criarProposta,
  decidirProposta,
  guardarBriefing,
  lerBriefing,
  marcarPropostaEnviada,
} from "@/lib/repositorios/comercial/propostas";
import { listarFuncionalidades, listarPacotes } from "@/lib/repositorios/funcionalidades";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Briefing e propostas (N.4, N.5). Os preços vêm da fórmula única (D.7) e a base de dados
// confere-os; depois de enviada, a proposta não muda (gatilho).

type Resultado = { ok: true; id?: string } | { ok: false; erro: string; campos?: string[] };

const uuid = z.string().uuid();
/** O código de erro da base de dados (raise exception 'codigo'). */
const codigo = (mensagem: string) => (/^[a-z_]+$/.test(mensagem) ? mensagem : "generico");

function revalidar(leadId: string) {
  revalidatePath(`/admin/comercial/leads/${leadId}`);
  revalidatePath("/admin/comercial/propostas");
  revalidatePath("/admin/comercial");
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
  const bd = await criarClienteServidor();
  const briefing = await lerBriefing(bd, leadId);
  const falta = emFaltaParaProposta(briefing);
  if (falta.length) return { ok: false, erro: "em_falta", campos: falta };
  const [catalogo, pacotes, condicoes] = await Promise.all([
    listarFuncionalidades(bd),
    listarPacotes(bd),
    lerCondicoes(bd),
  ]);
  // Descontos e taxa de migração (D-161): a base de dados confere outra vez os limites.
  const descontos = aplicarCondicoes(
    { mensalidade: briefing.desconto_mensalidade_pct, taxa: briefing.desconto_taxa_pct },
    condicoes,
    eAdministrador(quem.papel),
  );
  if (!descontos.ok) return { ok: false, erro: descontos.erro };
  const proposta = montarProposta(
    briefing,
    catalogo,
    pacotes,
    lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
    descontos,
  );
  const r = await criarProposta(bd, leadId, proposta);
  if ("erro" in r) return { ok: false, erro: codigo(r.erro) };
  revalidar(leadId);
  return { ok: true, id: r.id };
}

export async function marcarEnviada(leadId: string, propostaId: string): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const erro = await marcarPropostaEnviada(await criarClienteServidor(), propostaId);
  if (erro) return { ok: false, erro: codigo(erro) };
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
  if (erro) return { ok: false, erro: codigo(erro) };
  revalidar(leadId);
  return { ok: true };
}
