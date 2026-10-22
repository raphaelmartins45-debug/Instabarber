"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  exigirEquipaParaEscrever,
  exigirGestorParaEscrever,
  obterContextoEquipa,
} from "@/lib/equipa/contexto";
import { numericParaGravar } from "@/lib/formatacao/dinheiro";
import { hojeIso } from "@/lib/formatacao/datas";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { prepararDocumento } from "@/lib/faturacao";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { mensagemLembrete } from "@/lib/regras/mensagens";
import {
  atribuirProfissional,
  cancelarMarcacao,
  concluirMarcacao,
  criarMarcacaoBalcao,
  marcarFalta,
  obterMarcacao,
  registarLembrete,
  vagasDoDia,
} from "@/lib/repositorios/painel/agenda";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import {
  criarClienteBalcao,
  procurarPorTelefone,
  saldoSelos,
  temCreditoClube,
} from "@/lib/repositorios/painel/clientes";
import { saldoValido, usarCartao } from "@/lib/repositorios/painel/cartoes";
import { registarMensagemAberta } from "@/lib/repositorios/painel/mensagens";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaBalcao, esquemaConcluir } from "@/lib/validacao/agenda";

// Ações da agenda (E.2, E.3). O gestor mexe em todas; o barbeiro só nas suas (RLS e as funções
// concluir_marcacao/marcar_falta verificam). A vaga e o preço decidem-se na base de dados.

export type Resultado = { ok: true } | { ok: false; erro: string };

const uuid = z.string().uuid();

function revalidar() {
  revalidatePath("/app", "layout");
}

export async function procurarCliente(
  telefone: string,
): Promise<{ id: string; nome: string } | null> {
  const contexto = await obterContextoEquipa();
  const e164 = telefoneE164(telefone);
  if (!e164) return null;
  return procurarPorTelefone(await criarClienteServidor(), contexto.barbearia.id, e164);
}

export async function vagasLivres(
  servicoId: string,
  dia: string,
  profissionalId: string,
): Promise<string[]> {
  const contexto = await obterContextoEquipa();
  if (!uuid.safeParse(servicoId).success || !uuid.safeParse(profissionalId).success) return [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return [];
  const vagas = await vagasDoDia(
    await criarClienteServidor(),
    contexto.barbearia.id,
    servicoId,
    dia,
    profissionalId,
  );
  return vagas.map((v) => v.inicio);
}

/** Marcar ao balcão, ou registar um serviço feito agora (marca e conclui de seguida). */
export async function marcarAoBalcao(dados: z.input<typeof esquemaBalcao>): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  const v = esquemaBalcao.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const d = v.data;
  if (!contexto.eGestor && d.profissionalId !== contexto.profissionalId)
    return { ok: false, erro: "sem_permissao" };
  const bd = await criarClienteServidor();
  const inquilinoId = contexto.barbearia.id;

  let clienteId = (await procurarPorTelefone(bd, inquilinoId, d.telefone))?.id ?? null;
  if (!clienteId) {
    if (!d.nome) return { ok: false, erro: "nome" };
    clienteId = await criarClienteBalcao(bd, {
      inquilinoId,
      nome: d.nome,
      telefone: d.telefone,
      consentimento: d.consentimento,
    });
    if (!clienteId) return { ok: false, erro: "erro" };
  }

  const r = await criarMarcacaoBalcao(bd, {
    inquilinoId,
    clienteId,
    profissionalId: d.profissionalId,
    servicoId: d.servicoId,
    inicio: d.inicio,
    criadoPor: contexto.userId,
  });
  if (!r.ok) return { ok: false, erro: r.motivo };
  if (d.modo === "registar") {
    const c = await concluirMarcacao(
      bd,
      r.id!,
      "normal",
      d.valor === null ? null : numericParaGravar(d.valor),
    );
    if (!c.ok) return { ok: false, erro: c.motivo };
  }
  revalidar();
  return { ok: true };
}

export type DadosConclusao = {
  valorCent: number;
  selos: number;
  selosNecessarios: number;
  premio: boolean;
  clube: boolean;
  cartoes: boolean;
};

/** O que o diálogo «Concluir» mostra: valor, selos, prémio, crédito do clube e cartões. */
export async function dadosConclusao(id: string): Promise<DadosConclusao | null> {
  const contexto = await obterContextoEquipa();
  if (!uuid.safeParse(id).success) return null;
  const bd = await criarClienteServidor();
  const inquilinoId = contexto.barbearia.id;
  const m = await obterMarcacao(bd, inquilinoId, id);
  if (!m || !m.clienteId) return null;
  const [b, grelha] = await Promise.all([
    obterConfiguracao(bd, inquilinoId),
    lerGrelha(inquilinoId),
  ]);
  const selos = grelha.ativas.has("fidelizacao_selos") ? await saldoSelos(bd, m.clienteId) : 0;
  const clube = grelha.ativas.has("clube_assinatura")
    ? await temCreditoClube(bd, m.clienteId, m.servicoId, hojeIso())
    : false;
  return {
    valorCent: m.valorCobradoCent,
    selos,
    selosNecessarios: b.selos_necessarios,
    premio:
      grelha.ativas.has("fidelizacao_selos") &&
      selos >= b.selos_necessarios &&
      (!b.premio_ativo || b.premio_servico_id === m.servicoId),
    clube,
    cartoes: grelha.ativas.has("cartoes_oferta"),
  };
}

export async function concluir(dados: z.input<typeof esquemaConcluir>): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  const v = esquemaConcluir.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const d = v.data;
  const bd = await criarClienteServidor();
  const inquilinoId = contexto.barbearia.id;
  if (d.cartaoCodigo && d.cartaoValor) {
    // O cartão é um meio de pagamento: confirma-se o saldo antes de concluir e usa-se depois.
    const saldo = await saldoValido(bd, inquilinoId, d.cartaoCodigo, hojeIso());
    if (saldo === null) return { ok: false, erro: "cartao_invalido" };
    if (saldo < d.cartaoValor) return { ok: false, erro: "cartao_saldo" };
  }
  const r = await concluirMarcacao(
    bd,
    d.id,
    d.modo,
    d.valor === null ? null : numericParaGravar(d.valor),
  );
  if (!r.ok) return { ok: false, erro: r.motivo };
  if (d.cartaoCodigo && d.cartaoValor) {
    const u = await usarCartao(bd, {
      inquilinoId,
      codigo: d.cartaoCodigo,
      valorCent: d.cartaoValor,
      marcacaoId: d.id,
    });
    if (!u.ok) return { ok: false, erro: u.motivo };
  }
  // Faturação (G.4): desligada, não faz nada.
  await prepararDocumento(bd, { inquilinoId, marcacaoId: d.id });
  revalidar();
  return { ok: true };
}

export async function faltou(id: string): Promise<Resultado> {
  await exigirEquipaParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "marcacao_invalida" };
  const r = await marcarFalta(await criarClienteServidor(), id);
  if (!r.ok) return { ok: false, erro: r.motivo };
  revalidar();
  return { ok: true };
}

export async function cancelar(id: string): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "marcacao_invalida" };
  const r = await cancelarMarcacao(await criarClienteServidor(), contexto.barbearia.id, id);
  if (!r.ok) return { ok: false, erro: r.motivo };
  revalidar();
  return { ok: true };
}

/** Regista o lembrete aberto (marcação e tabela mensagens). A ligação já vai no botão. */
export async function lembreteAberto(id: string): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "marcacao_invalida" };
  const bd = await criarClienteServidor();
  const m = await obterMarcacao(bd, contexto.barbearia.id, id);
  if (!m) return { ok: false, erro: "marcacao_invalida" };
  await registarLembrete(bd, contexto.barbearia.id, id);
  await registarMensagemAberta(bd, {
    inquilinoId: contexto.barbearia.id,
    clienteId: m.clienteId,
    profissionalId: contexto.profissionalId ?? m.profissionalId,
    tipo: "lembrete",
    conteudo: mensagemLembrete({
      cliente: m.cliente ?? "",
      servico: m.servico,
      inicio: m.inicio,
      barbeiro: m.profissional ?? "",
      barbearia: contexto.barbearia.nome,
    }),
    referenciaId: id,
    criadoPor: contexto.userId,
  });
  revalidar();
  return { ok: true };
}

export async function atribuir(id: string, profissionalId: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success || !uuid.safeParse(profissionalId).success)
    return { ok: false, erro: "profissional_invalido" };
  const r = await atribuirProfissional(
    await criarClienteServidor(),
    contexto.barbearia.id,
    id,
    profissionalId,
  );
  if (!r.ok) return { ok: false, erro: r.motivo };
  revalidar();
  return { ok: true };
}
