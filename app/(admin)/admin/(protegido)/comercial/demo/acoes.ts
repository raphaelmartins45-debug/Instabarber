"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contasDemonstracao } from "@/lib/admin/contas-demonstracao";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { conviteDemonstracao } from "@/lib/email/convite-demonstracao";
import { enviarEmail } from "@/lib/email/enviar";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { textos } from "@/lib/i18n/pt-PT";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import { ESTILOS } from "@/lib/publico/estilos";
import {
  novoCodigoDemonstracao,
  obterDemonstracao,
  prepararDemonstracao,
} from "@/lib/repositorios/admin/demonstracao";
import { mudarEstadoLead, obterLead, registarEventoLead } from "@/lib/repositorios/comercial/leads";
import { carregarImagemPublica } from "@/lib/repositorios/painel/imagens";
import { ligacaoParaTelefone } from "@/lib/regras/whatsapp";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { ClienteBD } from "@/lib/supabase/tipos";

// A demonstração para os comerciais (D-207): «Gerar» refaz a barbearia de demonstração com os
// dados desta reunião e cria o código de acesso (D-208); com um lead escolhido, o convite segue
// para o e-mail dele e fica pronto o do WhatsApp (D-209). «Reset» repõe a de origem e anula o
// código. Toda a equipa da InstaBarber pode usar.

const t = textos.comercial.demonstracao;

export type Convite = {
  /** O que aconteceu ao e-mail do convite. */
  email: "enviado" | "falhou" | "sem_email";
  para: string | null;
  /** A conversa do WhatsApp com a mensagem pronta (regra 7: o envio confirma-se à mão). */
  whatsapp: string | null;
};

export type Resultado =
  | { ok: true; codigo?: string; convite?: Convite | null }
  | { ok: false; erro: string };

const esquema = z.object({
  nome: z.string().trim().min(2, "nome").max(60, "nome"),
  plano: z.enum(["basic", "pro"]),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "cor"),
  cidade: z.string().trim().max(60),
  whatsapp: z.string().trim().max(20),
  estilo: z.enum(ESTILOS),
  lead: z.union([z.literal(""), z.string().uuid("lead")]),
});

function revalidar() {
  revalidatePath("/admin/comercial/demo");
  revalidatePath("/demo");
}

/** Envia o convite ao lead (e-mail) e prepara o do WhatsApp; regista no histórico do lead. */
async function convidar(bd: ClienteBD, leadId: string, codigo: string): Promise<Convite | null> {
  const lead = await obterLead(bd, leadId);
  if (!lead) return null;
  const ligacao = `${await origemDoPedido()}/demo`;
  const nome = lead.nome_contacto.split(/\s+/)[0] ?? lead.nome_contacto;
  const barbearia = lead.nome_barbearia ?? lead.nome_contacto;
  const whatsapp = ligacaoParaTelefone(lead.telefone, t.mensagemWhatsapp(nome, ligacao, codigo));
  if (!lead.email) return { email: "sem_email", para: null, whatsapp };
  const para = lead.email;
  const enviado = await enviarEmail(() =>
    conviteDemonstracao({ para, nome, barbearia, ligacao, codigo }),
  );
  if (enviado) {
    await registarEventoLead(bd, lead.id, { tipo: "mensagem", texto: t.eventoConvite(para) });
    if (lead.estado === "novo" || lead.estado === "contactado")
      await mudarEstadoLead(bd, lead.id, { estado: "demonstracao" });
    revalidatePath(`/admin/comercial/leads/${lead.id}`);
  }
  return { email: enviado ? "enviado" : "falhou", para, whatsapp };
}

export async function gerarDemonstracao(formulario: FormData): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const v = esquema.safeParse(Object.fromEntries(formulario));
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const whatsapp = v.data.whatsapp ? telefoneE164(v.data.whatsapp) : null;
  if (v.data.whatsapp && !whatsapp) return { ok: false, erro: "whatsapp" };
  const bd = await criarClienteServidor();
  if (v.data.lead && !(await obterLead(bd, v.data.lead))) return { ok: false, erro: "lead" };
  const ficheiro = formulario.get("logo");
  let logo = (await obterDemonstracao(bd))?.logo_url ?? null;
  if (ficheiro instanceof File && ficheiro.size > 0) {
    logo = await carregarImagemPublica(bd, "demonstracao", ficheiro);
    if (!logo) return { ok: false, erro: "logo" };
  }
  const contas = await contasDemonstracao();
  const id = await prepararDemonstracao(bd, {
    plano: v.data.plano,
    gestor: contas?.gestor ?? null,
    barbeiro: contas?.barbeiro ?? null,
    nome: v.data.nome,
    logo,
    cor: v.data.cor.toUpperCase(),
    cidade: v.data.cidade || null,
    whatsapp,
    estilo: v.data.estilo,
  });
  revalidar();
  if (!id) return { ok: false, erro: "erro" };
  const codigo = await novoCodigoDemonstracao(bd);
  if (!codigo) return { ok: false, erro: "codigo" };
  const convite = v.data.lead ? await convidar(bd, v.data.lead, codigo) : null;
  return { ok: true, codigo, convite };
}

/** Um código novo para a demonstração atual; o anterior deixa de valer. */
export async function novoCodigo(): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const codigo = await novoCodigoDemonstracao(await criarClienteServidor());
  revalidar();
  return codigo ? { ok: true, codigo } : { ok: false, erro: "sem_demonstracao" };
}

/** Volta a enviar o convite ao lead, com o código que está à vista. */
export async function reenviarConvite(leadId: string, codigo: string): Promise<Resultado> {
  await exigirEquipaPlataforma();
  if (!z.string().uuid().safeParse(leadId).success || !/^\d{6}$/.test(codigo))
    return { ok: false, erro: "lead" };
  const convite = await convidar(await criarClienteServidor(), leadId, codigo);
  return convite ? { ok: true, codigo, convite } : { ok: false, erro: "lead" };
}

export async function reporDemonstracao(): Promise<Resultado> {
  await exigirEquipaPlataforma();
  const contas = await contasDemonstracao();
  const id = await prepararDemonstracao(await criarClienteServidor(), {
    plano: "pro",
    gestor: contas?.gestor ?? null,
    barbeiro: contas?.barbeiro ?? null,
    nome: null,
    logo: null,
    cor: null,
    cidade: null,
    whatsapp: null,
    estilo: "anuario",
  });
  revalidar();
  return id ? { ok: true } : { ok: false, erro: "erro" };
}
