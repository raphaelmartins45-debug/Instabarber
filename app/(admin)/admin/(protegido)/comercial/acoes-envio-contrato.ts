"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { pdfDoContrato } from "@/lib/comercial/pdf-contrato";
import { agradecimentoContrato, envioContrato, recusaContrato } from "@/lib/email/contrato-cliente";
import { enviarEmail } from "@/lib/email/enviar";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import {
  assinarContrato,
  type Contrato,
  obterContrato,
  prepararEnvioContrato,
  recusarCarregamento,
  urlPdfAssinado,
} from "@/lib/repositorios/comercial/contratos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { criarConvite } from "./acoes-contratos";

// Contrato enviado ao cliente por e-mail (D-181): enviar com a ligação segura, ver o PDF que o
// cliente carregou, aprovar (assina, cria o convite e agradece) ou recusar com o motivo.

type Resultado = { ok: true; email?: boolean } | { ok: false; erro: string };
const uuid = z.string().uuid();
const codigo = (m: string) => (/^[a-z_]+$/.test(m) ? m : "generico");

function revalidar(leadId: string) {
  revalidatePath(`/admin/comercial/leads/${leadId}`);
  revalidatePath("/admin/comercial/contratos");
  revalidatePath("/admin/documentos");
}

async function contratoDoLead(bd: ClienteBD, leadId: string, id: string) {
  if (!uuid.safeParse(leadId).success || !uuid.safeParse(id).success) return null;
  const c = await obterContrato(bd, id);
  return c && c.lead_id === leadId ? c : null;
}

const contratante = (c: Contrato) => c.dados as Record<string, string | undefined>;

/** Nova ligação para o cliente (só o hash fica guardado) e o endereço da página. */
async function novaLigacao(bd: ClienteBD, id: string) {
  const token = randomBytes(32).toString("base64url");
  const erro = await prepararEnvioContrato(bd, id, token);
  return erro ? { erro } : { ligacao: `${await origemDoPedido()}/adesao/contrato/${token}` };
}

export async function enviarAoCliente(leadId: string, id: string): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const c = await contratoDoLead(bd, leadId, id);
  const pdf = c ? await pdfDoContrato(bd, id) : null;
  if (!c || !pdf) return { ok: false, erro: "generico" };
  const { email, representante } = contratante(c);
  if (!email) return { ok: false, erro: "sem_email" };
  const l = await novaLigacao(bd, id);
  if ("erro" in l) return { ok: false, erro: codigo(l.erro!) };
  const enviado = await enviarEmail(() =>
    envioContrato({
      para: email,
      nome: representante ?? "",
      numero: c.numero,
      ligacao: l.ligacao,
      pdf: { nome: pdf.nome, conteudo: pdf.conteudo },
    }),
  );
  revalidar(leadId);
  return enviado ? { ok: true } : { ok: false, erro: "email" };
}

/** URL temporário (10 minutos) do PDF que o cliente carregou, para o conferir. */
export async function verCarregado(leadId: string, id: string): Promise<string | null> {
  await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const c = await contratoDoLead(bd, leadId, id);
  return c?.carregado_path ? urlPdfAssinado(bd, c.carregado_path) : null;
}

export async function aprovarCarregado(
  leadId: string,
  id: string,
  data: string,
): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const c = await contratoDoLead(bd, leadId, id);
  if (!c || c.estado !== "carregado" || !c.carregado_path || !/^\d{4}-\d{2}-\d{2}$/.test(data))
    return { ok: false, erro: "generico" };
  const erro = await assinarContrato(bd, id, data, c.carregado_path);
  if (erro) return { ok: false, erro: codigo(erro) };
  // O passo seguinte é a adesão: o convite de uso único segue no agradecimento.
  const convite = await criarConvite(leadId, id);
  const { email, representante } = contratante(c);
  const enviado =
    convite.ok && !!email
      ? await enviarEmail(() =>
          agradecimentoContrato({
            para: email,
            nome: representante ?? "",
            numero: c.numero,
            ligacaoAdesao: convite.ligacao,
          }),
        )
      : false;
  revalidar(leadId);
  return { ok: true, email: enviado };
}

export async function recusarCarregado(
  leadId: string,
  id: string,
  motivo: string,
): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const texto = z.string().trim().min(1).max(400).safeParse(motivo);
  if (!texto.success) return { ok: false, erro: "motivo_obrigatorio" };
  const bd = await criarClienteServidor();
  const c = await contratoDoLead(bd, leadId, id);
  if (!c) return { ok: false, erro: "generico" };
  const erro = await recusarCarregamento(bd, id, texto.data);
  if (erro) return { ok: false, erro: codigo(erro) };
  // Uma ligação nova, para o cliente carregar o PDF corrigido.
  const l = await novaLigacao(bd, id);
  const { email, representante } = contratante(c);
  const enviado =
    "ligacao" in l && email
      ? await enviarEmail(() =>
          recusaContrato({
            para: email,
            nome: representante ?? "",
            numero: c.numero,
            motivo: texto.data,
            ligacao: l.ligacao!,
          }),
        )
      : false;
  revalidar(leadId);
  return { ok: true, email: enviado };
}
