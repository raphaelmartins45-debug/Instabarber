"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaPlataforma, exigirSuperAdmin } from "@/lib/admin/contexto";
import { variavel } from "@/lib/configuracao/ambiente";
import {
  camposEmAberto,
  completarDepoisDeGerar,
  type DadosContratante,
  esquemaContratante,
  substituirMarcadores,
} from "@/lib/comercial/contrato";
import { lerModeloBase } from "@/lib/comercial/modelos-base";
import { valoresDoContrato } from "@/lib/comercial/valores-contrato";
import { textos } from "@/lib/i18n/pt-PT";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import {
  aprovarModelo,
  assinarContrato,
  criarConviteAdesao,
  criarModelo,
  editarRascunho,
  fixarTextoContrato,
  gerarContrato,
  marcarContratoEnviado,
  obterContrato,
  obterModelo,
  type TipoModelo,
  urlCarregamentoAssinado,
} from "@/lib/repositorios/comercial/contratos";
import { modeloAprovado, obterProposta } from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Modelos, contratos e convites de adesão (N.6 a N.8). Só o super_admin com dois fatores.

const t = textos.comercial.contratos;
type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; detalhe?: string };
const uuid = z.string().uuid();
const codigo = (m: string) => (/^[a-z_]+$/.test(m) ? m : "generico");

function revalidar(leadId?: string) {
  revalidatePath("/admin/comercial/modelos");
  revalidatePath("/admin/comercial/contratos");
  if (leadId) revalidatePath(`/admin/comercial/leads/${leadId}`);
}

export async function importarModeloBase(tipo: TipoModelo): Promise<Resultado> {
  await exigirSuperAdmin();
  if (!["contrato", "condicoes_proposta"].includes(tipo)) return { ok: false, erro: "generico" };
  const base = await lerModeloBase(tipo);
  const id = await criarModelo(await criarClienteServidor(), tipo, base.titulo, base.corpo);
  revalidar();
  return id ? { ok: true } : { ok: false, erro: "generico" };
}

export async function novaVersaoModelo(id: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const bd = await criarClienteServidor();
  const m = await obterModelo(bd, id);
  if (!m) return { ok: false, erro: "generico" };
  const novo = await criarModelo(bd, m.tipo as TipoModelo, m.titulo, m.corpo);
  revalidar();
  return novo ? { ok: true } : { ok: false, erro: "generico" };
}

export async function guardarModelo(id: string, titulo: string, corpo: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const v = z.object({
    titulo: z.string().trim().min(1).max(200),
    corpo: z.string().min(1).max(100_000),
  });
  const d = v.safeParse({ titulo, corpo });
  if (!d.success) return { ok: false, erro: "generico" };
  const ok = await editarRascunho(await criarClienteServidor(), id, d.data.titulo, d.data.corpo);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}

export async function aprovar(id: string): Promise<Resultado> {
  const admin = await exigirSuperAdmin();
  const ok = await aprovarModelo(await criarClienteServidor(), id, admin.userId);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}

/** Gera o contrato da proposta aceite com o modelo aprovado (N.6). */
export async function gerarDaProposta(
  leadId: string,
  propostaId: string,
  dados: DadosContratante,
): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const c = esquemaContratante.safeParse(dados);
  if (!c.success) return { ok: false, erro: c.error.issues[0]?.message ?? "generico" };
  const bd = await criarClienteServidor();
  const [modelo, p] = await Promise.all([
    modeloAprovado(bd, "contrato"),
    obterProposta(bd, propostaId),
  ]);
  if (!modelo) return { ok: false, erro: "modelo_nao_aprovado" };
  if (!p || p.estado !== "aceite" || p.lead_id !== leadId)
    return { ok: false, erro: "proposta_nao_aceite" };
  const valores = valoresDoContrato(
    {
      numero: p.numero!,
      plano: p.plano!,
      periodicidade: p.periodicidade!,
      profissionais: p.profissionais!,
      dominio_proprio: !!p.dominio_proprio,
      desafio_90: !!p.desafio_90,
      valor_periodo_sem_iva: String(p.valor_periodo_sem_iva),
      valor_periodo_com_iva: String(p.valor_periodo_com_iva),
      iva_taxa: Number(p.iva_taxa),
      condicoes_lancamento: p.condicoes_lancamento,
    },
    c.data,
    {
      nome: variavel("PRESTADORA_NOME"),
      nif: variavel("PRESTADORA_NIF"),
      morada: variavel("PRESTADORA_MORADA"),
      qualidade: variavel("PRESTADORA_QUALIDADE"),
      assinante: variavel("PRESTADORA_ASSINANTE"),
    },
  );
  const s = substituirMarcadores(modelo.corpo, valores, textos.comercial.naoAplicavel);
  if (!s.ok)
    return {
      ok: false,
      erro: "marcadores",
      detalhe: [...s.desconhecidos, ...s.emFalta].join(", "),
    };
  // Nenhum contrato sai com campos [em aberto] do modelo (prazos, foro, assinatura…).
  const abertos = camposEmAberto(s.texto);
  if (abertos.length)
    return { ok: false, erro: "campos_em_aberto", detalhe: abertos.slice(0, 8).join(" · ") };
  const r = await gerarContrato(bd, propostaId, modelo.id, { ...c.data }, s.texto);
  if ("erro" in r) return { ok: false, erro: codigo(r.erro) };
  const contrato = await obterContrato(bd, r.id);
  if (contrato)
    await fixarTextoContrato(
      bd,
      r.id,
      completarDepoisDeGerar(s.texto, contrato.numero, t.espacoData),
    );
  revalidar(leadId);
  return { ok: true };
}

export async function marcarEnviado(leadId: string, id: string): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const erro = await marcarContratoEnviado(await criarClienteServidor(), id);
  revalidar(leadId);
  return erro ? { ok: false, erro: codigo(erro) } : { ok: true };
}

/** URL assinado para o browser carregar o PDF assinado diretamente no Storage. */
export async function prepararCarregamento(
  leadId: string,
  id: string,
): Promise<Resultado<{ caminho: string; token: string }>> {
  await exigirEquipaPlataforma();
  if (!uuid.safeParse(leadId).success || !uuid.safeParse(id).success)
    return { ok: false, erro: "generico" };
  const caminho = `leads/${leadId}/contratos/${id}-assinado.pdf`;
  const token = await urlCarregamentoAssinado(await criarClienteServidor(), caminho);
  return token ? { ok: true, caminho, token } : { ok: false, erro: "generico" };
}

export async function registarAssinatura(
  leadId: string,
  id: string,
  data: string,
  caminho: string,
): Promise<Resultado> {
  await exigirEquipaPlataforma();
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
    caminho !== `leads/${leadId}/contratos/${id}-assinado.pdf`
  )
    return { ok: false, erro: "assinatura_incompleta" };
  const erro = await assinarContrato(await criarClienteServidor(), id, data, caminho);
  revalidar(leadId);
  return erro ? { ok: false, erro: codigo(erro) } : { ok: true };
}

/** Convite de uso único, válido 14 dias, com o formulário de adesão já preenchido (N.7). */
export async function criarConvite(
  leadId: string,
  id: string,
): Promise<Resultado<{ ligacao: string }>> {
  await exigirEquipaPlataforma();
  const bd = await criarClienteServidor();
  const contrato = await obterContrato(bd, id);
  if (!contrato || contrato.lead_id !== leadId) return { ok: false, erro: "generico" };
  const p = await obterProposta(bd, contrato.proposta_id);
  const dados = contrato.dados as Record<string, string>;
  const token = randomBytes(32).toString("base64url");
  // A forma é a do formulário de adesão (identidade, contactos, contratação); nunca palavra-passe.
  const erro = await criarConviteAdesao(bd, id, token, {
    identidade: { nome: dados.razao_social, responsavel: dados.representante, nif: dados.nif },
    contactos: { morada: dados.morada, email: dados.email },
    contratacao: {
      plano: p?.plano,
      periodicidade: p?.periodicidade,
      profissionais: p?.profissionais,
      email_acesso: dados.email,
    },
  });
  revalidar(leadId);
  if (erro) return { ok: false, erro: codigo(erro) };
  return { ok: true, ligacao: `${await origemDoPedido()}/adesao?convite=${token}` };
}
