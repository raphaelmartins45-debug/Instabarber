"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirDono } from "@/lib/admin/contexto";
import { convidarOuEncontrar, lerEntradas, reenviarConvite } from "@/lib/auth/contas";
import { DOMINIO } from "@/lib/email/enderecos";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import {
  alterarMembro,
  criarPerfilPlataforma,
  listarEquipaPlataforma,
} from "@/lib/repositorios/admin/equipa";
import { procurarUtilizadorPorEmail } from "@/lib/repositorios/perfis";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  type DadosConviteEquipa,
  doDominio,
  esquemaConviteEquipa,
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
