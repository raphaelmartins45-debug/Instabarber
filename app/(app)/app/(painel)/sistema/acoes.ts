"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { convidarOuEncontrar, reenviarConvite } from "@/lib/auth/contas";
import { exigirGestor } from "@/lib/equipa/contexto";
import { lerEndereco, origemDoPedido } from "@/lib/inquilino/endereco";
import {
  contasDosPerfis,
  criarPerfilProfissional,
  obterPerfil,
  procurarUtilizadorPorEmail,
} from "@/lib/repositorios/perfis";
import {
  apagarProfissionalSemHistorico,
  criarProfissional,
  ligarPerfilAoProfissional,
  listarEquipa,
  obterProfissional,
} from "@/lib/repositorios/profissionais";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaRegistarBarbeiro, type DadosRegistarBarbeiro } from "@/lib/validacao/barbeiro";

// Registo de um barbeiro novo (E.3): o servidor cria a conta com convite por e-mail,
// o perfil ligado à barbearia e a linha em profissionais. O NIF nunca é palavra-passe.

export type ResultadoRegisto =
  | { ok: true; novo: boolean; nome: string; email: string }
  | { ok: false; erro: string };

async function destinoConvite(): Promise<string> {
  const prefixo = (await lerEndereco()).slug ? "/app" : "";
  return `${await origemDoPedido()}${prefixo}/entrar/confirmar`;
}

export async function registarBarbeiro(dados: DadosRegistarBarbeiro): Promise<ResultadoRegisto> {
  const { barbearia } = await exigirGestor();
  const v = esquemaRegistarBarbeiro.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "generico" };
  const { nome, email, nif } = v.data;

  const bd = await criarClienteServidor();
  if ((await listarEquipa(bd, barbearia.id)).some((p) => p.email === email)) {
    return { ok: false, erro: "repetido" };
  }
  // Primeiro a linha do profissional, com as permissões do gestor: o RLS e o limite de
  // profissionais contratados decidem antes de se criar qualquer conta.
  const criado = await criarProfissional(bd, { inquilinoId: barbearia.id, nome, email, nif });
  if (!criado.ok)
    return {
      ok: false,
      erro: criado.motivo.includes("limite_profissionais") ? "limite" : "generico",
    };

  const servico = criarClienteServico();
  try {
    const conta = await convidarOuEncontrar(
      servico,
      { email, nome, destino: await destinoConvite() },
      (e) => procurarUtilizadorPorEmail(servico, e),
    );
    if (!conta.ok) throw new Error(conta.motivo);
    if (await obterPerfil(servico, conta.userId, barbearia.id, "profissional"))
      throw new Error("repetido");
    const perfilId = await criarPerfilProfissional(servico, {
      userId: conta.userId,
      inquilinoId: barbearia.id,
      nome,
      email,
    });
    await ligarPerfilAoProfissional(bd, criado.id, perfilId);
    revalidatePath("/app/sistema");
    return { ok: true, novo: conta.novo, nome, email };
  } catch (erro) {
    await apagarProfissionalSemHistorico(servico, criado.id);
    return {
      ok: false,
      erro: erro instanceof Error && erro.message === "repetido" ? "repetido" : "generico",
    };
  }
}

export async function reenviarConviteBarbeiro(profissionalId: string): Promise<{ ok: boolean }> {
  const { barbearia } = await exigirGestor();
  const id = z.string().uuid().safeParse(profissionalId);
  if (!id.success) return { ok: false };
  const bd = await criarClienteServidor();
  const profissional = await obterProfissional(bd, barbearia.id, id.data);
  if (!profissional?.email || !profissional.perfil_id) return { ok: false };
  // Só a quem ainda não entrou: a conta tem de ser desta barbearia (lida pelo RLS do gestor).
  if (!(await contasDosPerfis(bd, [profissional.perfil_id])).size) return { ok: false };
  return {
    ok: await reenviarConvite(criarClienteServico(), profissional.email, await destinoConvite()),
  };
}
