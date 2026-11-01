"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirDono } from "@/lib/admin/contexto";
import {
  apagarContas,
  convidarOuEncontrar,
  lerEntradas,
  mudarEmailConta,
  reenviarConvite,
} from "@/lib/auth/contas";
import { DOMINIO } from "@/lib/email/enderecos";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import {
  alterarMembro,
  criarPerfilPlataforma,
  listarEquipaPlataforma,
} from "@/lib/repositorios/admin/equipa";
import { passarLeads } from "@/lib/repositorios/comercial/leads";
import { procurarUtilizadorPorEmail } from "@/lib/repositorios/perfis";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import {
  type DadosConviteEquipa,
  type DadosEdicaoEquipa,
  doDominio,
  esquemaConviteEquipa,
  esquemaEdicaoEquipa,
  PAPEIS_CONVIDAVEIS,
} from "@/lib/validacao/equipa-plataforma";

// Equipa InstaBarber (D-161): só o dono. A conta cria-se com a chave de serviço (convite por
// e-mail, a pessoa define a palavra-passe); o perfil grava-se com a sessão do dono (RLS).

type Resultado = { ok: true } | { ok: false; erro: string };
const uuid = z.string().uuid();
const destino = async () => `${await origemDoPedido()}/entrar/confirmar`;

export async function convidar(dados: DadosConviteEquipa): Promise<Resultado> {
  await exigirDono();
  const v = esquemaConviteEquipa.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "generico" };
  if (!doDominio(v.data.email, DOMINIO)) return { ok: false, erro: "dominio" };
  const bd = await criarClienteServidor();
  if ((await listarEquipaPlataforma(bd)).some((m) => m.email === v.data.email))
    return { ok: false, erro: "repetido" };
  const servico = criarClienteServico();
  const conta = await convidarOuEncontrar(
    servico,
    { email: v.data.email, nome: v.data.nome, destino: await destino() },
    (e) => procurarUtilizadorPorEmail(servico, e),
  );
  if (!conta.ok) return { ok: false, erro: "generico" };
  const ok = await criarPerfilPlataforma(bd, { userId: conta.userId, ...v.data });
  revalidatePath("/admin/equipa");
  return ok ? { ok: true } : { ok: false, erro: "repetido" };
}

/** Muda o papel ou desativa/reativa. O dono não se altera a si próprio. */
export async function alterar(
  perfilId: string,
  alteracao: { papel?: string; ativo?: boolean },
): Promise<Resultado> {
  const { userId } = await exigirDono();
  const papel = z.enum(PAPEIS_CONVIDAVEIS).optional().safeParse(alteracao.papel);
  if (!uuid.safeParse(perfilId).success || !papel.success) return { ok: false, erro: "generico" };
  const bd = await criarClienteServidor();
  const membro = (await listarEquipaPlataforma(bd)).find((m) => m.perfilId === perfilId);
  if (!membro || membro.userId === userId || membro.papel === "super_admin")
    return { ok: false, erro: "generico" };
  const ok = await alterarMembro(bd, perfilId, {
    ...(papel.data ? { papel: papel.data } : {}),
    ...(alteracao.ativo === undefined ? {} : { ativo: !!alteracao.ativo }),
  });
  revalidatePath("/admin/equipa");
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}

/**
 * Edita o nome, o e-mail de entrada e o telefone de uma pessoa da equipa, o próprio dono incluído
 * (D-186). O nome é o que assina as propostas e o folheto. O e-mail muda também na conta do
 * Supabase Auth (chave de serviço, autorizado pelo dono). Só o dono (RLS perfis_escrever_plataforma).
 */
export async function editar(perfilId: string, dados: DadosEdicaoEquipa): Promise<Resultado> {
  await exigirDono();
  const v = esquemaEdicaoEquipa.safeParse(dados);
  if (!uuid.safeParse(perfilId).success || !v.success)
    return { ok: false, erro: v.success ? "generico" : (v.error.issues[0]?.message ?? "generico") };
  if (!doDominio(v.data.email, DOMINIO)) return { ok: false, erro: "dominio" };
  const telefone = v.data.telefone ? telefoneE164(v.data.telefone) : null;
  if (v.data.telefone && !telefone) return { ok: false, erro: "telefone" };
  const bd = await criarClienteServidor();
  const equipa = await listarEquipaPlataforma(bd);
  const membro = equipa.find((m) => m.perfilId === perfilId);
  if (!membro) return { ok: false, erro: "generico" };
  if (v.data.email !== membro.email) {
    if (equipa.some((m) => m.email === v.data.email)) return { ok: false, erro: "repetido" };
    if (!(await mudarEmailConta(criarClienteServico(), membro.userId, v.data.email)))
      return { ok: false, erro: "repetido" };
  }
  const ok = await alterarMembro(bd, perfilId, {
    nome: v.data.nome,
    email: v.data.email,
    telefone,
  });
  revalidatePath("/admin/equipa");
  return ok ? { ok: true } : { ok: false, erro: "generico" };
}

/**
 * Apaga a conta de uma pessoa da equipa (D-186, autorizado pelo dono). Antes, os leads dela passam
 * para quem o dono escolheu (outra pessoa ativa da equipa) ou ficam por atribuir. O perfil vai
 * com a conta; propostas e histórico ficam. O dono não se apaga a si próprio.
 */
export async function apagar(perfilId: string, destino: string | null): Promise<Resultado> {
  const { userId } = await exigirDono();
  if (!uuid.safeParse(perfilId).success || (destino !== null && !uuid.safeParse(destino).success))
    return { ok: false, erro: "generico" };
  const bd = await criarClienteServidor();
  const equipa = await listarEquipaPlataforma(bd);
  const membro = equipa.find((m) => m.perfilId === perfilId);
  if (!membro || membro.userId === userId || membro.papel === "super_admin")
    return { ok: false, erro: "generico" };
  if (destino !== null && !equipa.some((m) => m.userId === destino && m.ativo && m !== membro))
    return { ok: false, erro: "generico" };
  if ((await passarLeads(bd, membro.userId, destino)) === null)
    return { ok: false, erro: "generico" };
  const apagadas = await apagarContas(criarClienteServico(), [membro.userId]);
  revalidatePath("/admin/equipa");
  revalidatePath("/admin/comercial");
  return apagadas === 1 ? { ok: true } : { ok: false, erro: "generico" };
}

/** Volta a enviar o convite a quem ainda não entrou. */
export async function reenviar(perfilId: string): Promise<Resultado> {
  await exigirDono();
  const membro = (await listarEquipaPlataforma(await criarClienteServidor())).find(
    (m) => m.perfilId === perfilId,
  );
  if (!membro?.email) return { ok: false, erro: "generico" };
  const servico = criarClienteServico();
  const entrada = (await lerEntradas(servico, [membro.userId])).get(membro.userId);
  if (entrada?.ultimaEntrada) return { ok: false, erro: "ja_entrou" };
  return (await reenviarConvite(servico, membro.email, await destino()))
    ? { ok: true }
    : { ok: false, erro: "generico" };
}
