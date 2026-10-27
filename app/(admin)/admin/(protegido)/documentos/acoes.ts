"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma, exigirSuperAdmin } from "@/lib/admin/contexto";
import { esquemaBriefing } from "@/lib/comercial/briefing";
import { gerarPropostaDoLead } from "@/lib/comercial/gerar-proposta";
import { pdfGuiaDeArranque } from "@/lib/documentos/guia";
import { envioGuia } from "@/lib/email/adesao-decisao";
import { enviarEmail } from "@/lib/email/enviar";
import { registarAcaoAdmin } from "@/lib/repositorios/admin/auditoria";
import { criarLead } from "@/lib/repositorios/comercial/leads";
import { mudarMeuTelefone } from "@/lib/repositorios/perfis";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { guardarBriefing } from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaNovoLead } from "@/lib/validacao/comercial";
import {
  type DadosPropostaRapida,
  dividirPropostaRapida,
  esquemaPropostaRapida,
} from "@/lib/validacao/documentos";

// Gerador de documentos (D-181): a proposta rápida (lead novo, briefing e proposta de uma vez)
// e o reenvio do guia de arranque ao proprietário.

export type ResultadoPropostaRapida =
  | { ok: true; leadId: string; propostaId: string | null; erro?: string; campos?: string[] }
  | { ok: false; erro: string; campos?: string[] };

export async function propostaRapida(dados: DadosPropostaRapida): Promise<ResultadoPropostaRapida> {
  const quem = await exigirEquipaPlataforma();
  const v = esquemaPropostaRapida.safeParse(dados);
  if (!v.success)
    return { ok: false, erro: "invalido", campos: v.error.issues.map((i) => String(i.path[0])) };
  const { lead, briefing } = dividirPropostaRapida(v.data);
  const bd = await criarClienteServidor();
  const leadId = await criarLead(bd, esquemaNovoLead.parse(lead), quem.userId);
  if (!leadId) return { ok: false, erro: "generico" };
  revalidatePath("/admin/comercial");
  if (!(await guardarBriefing(bd, leadId, esquemaBriefing.parse(briefing), quem.userId)))
    return { ok: true, leadId, propostaId: null, erro: "generico" };
  const r = await gerarPropostaDoLead(bd, leadId, eAdministrador(quem.papel));
  revalidatePath("/admin/documentos");
  // O lead fica criado mesmo que a proposta falhe: o erro aparece e continua-se na ficha.
  return r.ok
    ? { ok: true, leadId, propostaId: r.id }
    : { ok: true, leadId, propostaId: null, erro: r.erro, campos: r.campos };
}

/** Envia outra vez o guia de arranque ao proprietário, assinado por quem envia. */
export async function enviarGuia(inquilinoId: string): Promise<{ ok: boolean }> {
  const quem = await exigirSuperAdmin();
  if (!z.string().uuid().safeParse(inquilinoId).success) return { ok: false };
  const bd = await criarClienteServidor();
  const guia = await pdfGuiaDeArranque(bd, inquilinoId, quem.userId);
  if (!guia?.para) return { ok: false };
  const ok = await enviarEmail(() =>
    envioGuia({
      para: guia.para!,
      responsavel: guia.responsavel,
      barbearia: guia.barbearia,
      guia,
    }),
  );
  if (ok)
    await registarAcaoAdmin(bd, {
      inquilinoId,
      accao: "guia_enviado",
      entidade: "inquilinos",
      entidadeId: inquilinoId,
    });
  return { ok };
}

/** O telefone de quem está na equipa, para o folheto (vazio apaga). */
export async function guardarMeuTelefone(texto: string): Promise<{ ok: boolean }> {
  await exigirEquipaPlataforma();
  const limpo = texto.trim();
  const e164 = limpo ? telefoneE164(limpo) : null;
  if (limpo && !e164) return { ok: false };
  const ok = await mudarMeuTelefone(await criarClienteServidor(), e164);
  revalidatePath("/admin/documentos");
  return { ok };
}
