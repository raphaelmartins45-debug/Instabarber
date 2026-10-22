"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaParaEscrever } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { filaEsperaDoDia } from "@/lib/painel/filas";
import { avaliacoesDoDia } from "@/lib/painel/mensagens-agenda";
import { obterMarcacao } from "@/lib/repositorios/painel/agenda";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { registarMensagemAberta } from "@/lib/repositorios/painel/mensagens";
import {
  avisarFilaEspera,
  mudarEstadoEspera,
  mudarEstadoPresencial,
} from "@/lib/repositorios/painel/filas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Filas e pedidos de avaliação no painel (F.4.1, F.4.3, F.4.13). O aviso grava o prazo na base de dados e regista a ligação
// aberta; a mensagem volta a montar-se aqui com o mesmo gerador do botão.

export type Resultado = { ok: true } | { ok: false; erro: string };

const uuid = z.string().uuid();
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const revalidar = () => revalidatePath("/app", "layout");

export async function avisarFila(entradaId: string, diaIso: string): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  if (!uuid.safeParse(entradaId).success || !dia.safeParse(diaIso).success)
    return { ok: false, erro: "erro" };
  const bd = await criarClienteServidor();
  const entrada = (
    await filaEsperaDoDia(bd, contexto.barbearia.id, contexto.barbearia.nome, diaIso)
  ).find((e) => e.id === entradaId);
  if (!entrada?.aviso) return { ok: false, erro: "sem_vaga" };
  if (!(await avisarFilaEspera(bd, entradaId))) return { ok: false, erro: "erro" };
  await registarMensagemAberta(bd, {
    inquilinoId: contexto.barbearia.id,
    clienteId: entrada.clienteId,
    profissionalId: contexto.profissionalId,
    tipo: "fila",
    conteudo: entrada.aviso.conteudo,
    referenciaId: entradaId,
    criadoPor: contexto.userId,
  });
  revalidar();
  return { ok: true };
}

const estadosEspera = z.enum(["aceite", "expirado", "removido"]);

export async function estadoFilaEspera(entradaId: string, estado: string): Promise<Resultado> {
  await exigirEquipaParaEscrever();
  const e = estadosEspera.safeParse(estado);
  if (!uuid.safeParse(entradaId).success || !e.success) return { ok: false, erro: "erro" };
  const ok = await mudarEstadoEspera(await criarClienteServidor(), entradaId, e.data);
  if (!ok) return { ok: false, erro: "erro" };
  revalidar();
  return { ok: true };
}

const estadosPresencial = z.enum(["em_atendimento", "atendido", "saiu"]);

/** Chamar fica com quem carrega no botão, quando trabalha na barbearia. */
export async function estadoFilaPresencial(entradaId: string, estado: string): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  const e = estadosPresencial.safeParse(estado);
  if (!uuid.safeParse(entradaId).success || !e.success) return { ok: false, erro: "erro" };
  const ok = await mudarEstadoPresencial(
    await criarClienteServidor(),
    entradaId,
    e.data,
    contexto.profissionalId,
  );
  if (!ok) return { ok: false, erro: "erro" };
  revalidar();
  return { ok: true };
}

/** Regista o pedido de avaliação (F.4.13), voltando a confirmar as regras no servidor. */
export async function avaliacaoAberta(marcacaoId: string): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  if (!uuid.safeParse(marcacaoId).success) return { ok: false, erro: "erro" };
  const bd = await criarClienteServidor();
  const [grelha, m, b] = await Promise.all([
    lerGrelha(contexto.barbearia.id),
    obterMarcacao(bd, contexto.barbearia.id, marcacaoId),
    obterConfiguracao(bd, contexto.barbearia.id),
  ]);
  if (!grelha.ativas.has("pedido_avaliacao") || !m) return { ok: false, erro: "erro" };
  const pedido = (
    await avaliacoesDoDia(bd, contexto.barbearia.id, [m], {
      ligacao: b.google_avaliacao_url,
      assinatura: contexto.barbearia.nome,
    })
  )[m.id];
  if (!pedido) return { ok: false, erro: "erro" };
  await registarMensagemAberta(bd, {
    inquilinoId: contexto.barbearia.id,
    clienteId: m.clienteId,
    profissionalId: contexto.profissionalId ?? m.profissionalId,
    tipo: "avaliacao",
    conteudo: pedido.conteudo,
    referenciaId: m.id,
    criadoPor: contexto.userId,
  });
  revalidar();
  return { ok: true };
}
