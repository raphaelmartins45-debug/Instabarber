"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { convidarOuEncontrar, reenviarConvite } from "@/lib/auth/contas";
import { exigirGestorParaEscrever } from "@/lib/equipa/contexto";
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
  alterarProfissional,
  gravarComissoesServico,
  listarEquipa,
  listarFichasEquipa,
  obterProfissional,
} from "@/lib/repositorios/profissionais";
import { numericParaGravar } from "@/lib/formatacao/dinheiro";
import { gravarHorario } from "@/lib/repositorios/painel/horarios";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaRegistarBarbeiro, type DadosRegistarBarbeiro } from "@/lib/validacao/barbeiro";
import { esquemaFichaBarbeiro, esquemaHorarioBarbeiro } from "@/lib/validacao/sistema";

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
  const { barbearia } = await exigirGestorParaEscrever();
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
  const { barbearia } = await exigirGestorParaEscrever();
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

export type ResultadoFichaBarbeiro = { ok: true } | { ok: false; erro: string };

const idProfissional = z.string().uuid();

/** Comissão por omissão e por serviço, modelo de caixa e renda (F.4.8, F.4.11). */
export async function guardarFichaBarbeiro(
  id: string,
  dados: z.input<typeof esquemaFichaBarbeiro>,
): Promise<ResultadoFichaBarbeiro> {
  const { barbearia } = await exigirGestorParaEscrever();
  const v = esquemaFichaBarbeiro.safeParse(dados);
  if (!idProfissional.safeParse(id).success || !v.success)
    return { ok: false, erro: v.error?.issues[0]?.message ?? "erro" };
  const bd = await criarClienteServidor();
  const r = await alterarProfissional(bd, barbearia.id, id, {
    comissao_percent: v.data.comissao,
    modelo_caixa: v.data.modelo,
    renda_valor: v.data.renda === null ? null : numericParaGravar(v.data.renda),
    renda_dia_vencimento: v.data.rendaDia,
  });
  if (!r.ok) return { ok: false, erro: "erro" };
  const ok = await gravarComissoesServico(bd, barbearia.id, id, v.data.porServico);
  revalidatePath("/app", "layout");
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

/** «Aplicar a todos»: o mesmo modelo de caixa para a equipa ativa. O C exige renda em cada um. */
export async function aplicarModeloATodos(modelo: string): Promise<ResultadoFichaBarbeiro> {
  const { barbearia } = await exigirGestorParaEscrever();
  const m = z.enum(["A", "B", "C"]).safeParse(modelo);
  if (!m.success) return { ok: false, erro: "erro" };
  const bd = await criarClienteServidor();
  const equipa = (await listarFichasEquipa(bd, barbearia.id)).filter((p) => p.ativo);
  if (m.data === "C" && equipa.some((p) => p.renda_valor === null))
    return { ok: false, erro: "renda" };
  for (const p of equipa)
    await alterarProfissional(bd, barbearia.id, p.id, { modelo_caixa: m.data });
  revalidatePath("/app", "layout");
  return { ok: true };
}

/** Horário próprio do barbeiro (sem linhas, vale o da barbearia). */
export async function guardarHorarioBarbeiro(
  id: string,
  linhas: z.input<typeof esquemaHorarioBarbeiro>,
): Promise<ResultadoFichaBarbeiro> {
  const { barbearia } = await exigirGestorParaEscrever();
  const v = esquemaHorarioBarbeiro.safeParse(linhas);
  if (!idProfissional.safeParse(id).success || !v.success) return { ok: false, erro: "horario" };
  const ok = await gravarHorario(await criarClienteServidor(), barbearia.id, id, v.data);
  revalidatePath("/app", "layout");
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

/** Cancelar ou repor o acesso: as marcações futuras ficam órfãs (gatilho); o histórico fica. */
export async function mudarAcessoBarbeiro(
  id: string,
  ativo: boolean,
): Promise<ResultadoFichaBarbeiro> {
  const { barbearia } = await exigirGestorParaEscrever();
  if (!idProfissional.safeParse(id).success) return { ok: false, erro: "erro" };
  const r = await alterarProfissional(await criarClienteServidor(), barbearia.id, id, {
    ativo: !!ativo,
  });
  revalidatePath("/app", "layout");
  if (!r.ok)
    return {
      ok: false,
      erro: r.motivo.includes("limite_profissionais") ? "limite_profissionais" : "erro",
    };
  return { ok: true };
}
