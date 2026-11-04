"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaPlataforma, exigirSuperAdmin } from "@/lib/admin/contexto";
import {
  apagarLeadsInativos,
  atribuirResponsavel,
  atualizarLead,
  criarLead,
  type LeadSemelhante,
  leadsSemelhantes,
  marcarDemoLead,
  mudarEstadoLead,
  obterLead,
  registarEventoLead,
} from "@/lib/repositorios/comercial/leads";
import { confirmacaoDemonstracao } from "@/lib/email/convite-demonstracao";
import { enviarEmail } from "@/lib/email/enviar";
import { instanteLocal, quandoPorExtenso } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import { ligacaoParaTelefone } from "@/lib/regras/whatsapp";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  esquemaDemo,
  esquemaEstado,
  esquemaEvento,
  esquemaLead,
  esquemaNovoLead,
  type DadosDemo,
  type DadosEstado,
  type DadosEvento,
  type DadosLead,
  type DadosNovoLead,
} from "@/lib/validacao/comercial";

// Ações do Comercial (N.3). A equipa InstaBarber com dois fatores: o comercial só nos seus leads,
// e atribuir ou apagar é dos administradores (D-161); a base de dados confere outra vez.

type Resultado = { ok: true; id?: string } | { ok: false; erro: string };

const erroDe = (issues: { message: string }[]) => issues[0]?.message ?? "generico";

function revalidar(id?: string) {
  revalidatePath("/admin/comercial");
  revalidatePath("/admin/comercial/leads");
  if (id) revalidatePath(`/admin/comercial/leads/${id}`);
}

export async function criar(dados: DadosNovoLead): Promise<Resultado> {
  const admin = await exigirEquipaPlataforma();
  const v = esquemaNovoLead.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  const id = await criarLead(await criarClienteServidor(), v.data, admin.userId);
  if (!id) return { ok: false, erro: "generico" };
  revalidar();
  return { ok: true, id };
}

/** Aviso de duplicado ao criar um lead: o mesmo telemóvel, Instagram ou morada (D-174). */
export async function procurarSemelhantes(
  telefone: string,
  instagram: string,
  morada: string,
): Promise<LeadSemelhante[]> {
  await exigirEquipaPlataforma();
  const texto = z.string().max(240);
  if (![telefone, instagram, morada].every((v) => texto.safeParse(v).success)) return [];
  return leadsSemelhantes(await criarClienteServidor(), telefone, instagram, morada);
}

export async function atualizar(id: string, dados: DadosLead): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const v = esquemaLead.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  if (!(await atualizarLead(await criarClienteServidor(), id, v.data)))
    return { ok: false, erro: "generico" };
  revalidar(id);
  return { ok: true };
}

export async function mudarEstado(id: string, dados: DadosEstado): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const v = esquemaEstado.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  if (!(await mudarEstadoLead(await criarClienteServidor(), id, v.data)))
    return { ok: false, erro: "generico" };
  revalidar(id);
  return { ok: true };
}

export type DemoMarcada =
  | {
      ok: true;
      email: "enviado" | "falhou" | "sem_email";
      para: string | null;
      whatsapp: string | null;
    }
  | { ok: false; erro: string };

/**
 * Marca (ou remarca) a demonstração (D-211): o lead passa a «Demo marcada», recebe a confirmação
 * por e-mail com o dia e a hora, e fica pronta a mensagem do WhatsApp (regra 7).
 */
export async function marcarDemonstracao(id: string, dados: DadosDemo): Promise<DemoMarcada> {
  await exigirEquipaPlataforma();
  const v = esquemaDemo.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  const bd = await criarClienteServidor();
  const em = instanteLocal(v.data.data, v.data.hora);
  const r = await marcarDemoLead(bd, id, em);
  if (!r.ok) return r;
  const lead = await obterLead(bd, id);
  revalidar(id);
  if (!lead) return { ok: true, email: "sem_email", para: null, whatsapp: null };
  const t = textos.comercial.marcarDemo;
  const nome = lead.nome_contacto.split(/\s+/)[0] ?? lead.nome_contacto;
  const quando = quandoPorExtenso(em);
  const whatsapp = ligacaoParaTelefone(lead.telefone, t.mensagemWhatsapp(nome, quando));
  if (!lead.email) return { ok: true, email: "sem_email", para: null, whatsapp };
  const para = lead.email;
  const enviado = await enviarEmail(() => confirmacaoDemonstracao({ para, nome, quando }));
  if (enviado) await registarEventoLead(bd, id, { tipo: "mensagem", texto: t.eventoEmail(para) });
  return { ok: true, email: enviado ? "enviado" : "falhou", para, whatsapp };
}

export async function registarEvento(id: string, dados: DadosEvento): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const v = esquemaEvento.safeParse(dados);
  if (!v.success) return { ok: false, erro: erroDe(v.error.issues) };
  if (!(await registarEventoLead(await criarClienteServidor(), id, v.data)))
    return { ok: false, erro: "generico" };
  revalidar(id);
  return { ok: true };
}

export async function apagarInativos(): Promise<
  { ok: true; n: number } | { ok: false; erro: string }
> {
  await exigirSuperAdmin();
  const n = await apagarLeadsInativos(await criarClienteServidor());
  revalidar();
  return n === null ? { ok: false, erro: "generico" } : { ok: true, n };
}

/** Atribui o lead a um comercial, ou tira-lho (D-161). Só o dono e o gestor. */
export async function atribuir(id: string, responsavel: string): Promise<Resultado> {
  await exigirSuperAdmin();
  const v = z.union([z.literal(""), z.guid()]).safeParse(responsavel);
  if (!z.guid().safeParse(id).success || !v.success) return { ok: false, erro: "generico" };
  const ok = await atribuirResponsavel(await criarClienteServidor(), id, v.data || null);
  revalidar(id);
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}
