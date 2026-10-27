"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaParaEscrever, exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { alterarCliente, obterCliente } from "@/lib/repositorios/painel/clientes";
import {
  apagarNotaTecnica,
  criarNotaTecnica,
  type FotoNova,
  mudarVisibilidadeNota,
  registarConsentimentoFotos,
} from "@/lib/repositorios/painel/historico-cortes";
import { registarMensagemAberta } from "@/lib/repositorios/painel/mensagens";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaDadosCliente, FOTO_FICHA } from "@/lib/validacao/cliente";

// Ações sobre clientes (E.2, E.3). O RLS limita o barbeiro aos seus clientes.

const esquemaMensagem = z.object({
  clienteId: z.string().uuid(),
  tipo: z.enum(["recuperacao", "posvenda", "aniversario"]),
  conteudo: z.string().max(2000),
});

/** Regista a mensagem aberta por wa.me (tentativa, nunca prova de envio). Pro: envio_mensagens. */
export async function mensagemAberta(clienteId: string, tipo: string, conteudo: string) {
  const contexto = await exigirEquipaParaEscrever();
  const v = esquemaMensagem.safeParse({ clienteId, tipo, conteudo });
  if (!v.success) return { ok: false };
  const grelha = await lerGrelha(contexto.barbearia.id);
  if (!grelha.ativas.has("envio_mensagens")) return { ok: false };
  const ok = await registarMensagemAberta(await criarClienteServidor(), {
    inquilinoId: contexto.barbearia.id,
    clienteId: v.data.clienteId,
    profissionalId: contexto.profissionalId,
    tipo: v.data.tipo,
    conteudo: v.data.conteudo,
    criadoPor: contexto.userId,
  });
  revalidatePath("/app", "layout");
  return { ok };
}

export type Resultado = { ok: true } | { ok: false; erro: string };

const uuid = z.string().uuid();

/** Dados do cliente: só o gestor (o consentimento grava a data em que foi dado). */
export async function guardarDadosCliente(
  id: string,
  dados: z.input<typeof esquemaDadosCliente>,
): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaDadosCliente.safeParse(dados);
  if (!uuid.safeParse(id).success || !v.success)
    return { ok: false, erro: v.error?.issues[0]?.message ?? "erro" };
  const bd = await criarClienteServidor();
  const atual = await obterCliente(bd, contexto.barbearia.id, id);
  if (!atual) return { ok: false, erro: "erro" };
  const consentimentoEm = v.data.consentimento_mensagens
    ? (atual.consentimento_em ?? new Date().toISOString())
    : null;
  const ok = await alterarCliente(bd, contexto.barbearia.id, id, {
    ...v.data,
    consentimento_em: consentimentoEm,
  });
  revalidatePath("/app", "layout");
  return ok ? { ok: true } : { ok: false, erro: "telefone_repetido" };
}

/** «Voltar a permitir marcação online» (F.8): as faltas anteriores deixam de contar. */
export async function permitirMarcacaoOnline(id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await alterarCliente(await criarClienteServidor(), contexto.barbearia.id, id, {
    faltas_perdoadas_em: new Date().toISOString(),
  });
  revalidatePath("/app", "layout");
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

/** Direito de eliminação (H): anonimiza e mantém os registos financeiros sem identificação. */
export async function anonimizar(id: string): Promise<Resultado> {
  await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const { error } = await (
    await criarClienteServidor()
  ).rpc("anonimizar_cliente", { p_cliente: id });
  revalidatePath("/app", "layout");
  return error ? { ok: false, erro: "erro" } : { ok: true };
}

const textoLivre = (formulario: FormData, campo: string) =>
  String(formulario.get(campo) ?? "")
    .trim()
    .slice(0, 1000) || null;

/**
 * Nova entrada do histórico de cortes (F.4.14, D-179): nota interna, nota para o cliente, até duas
 * fotografias (JPG, PNG ou WEBP até 3 MB), o serviço ligado e se o cliente a vê. Com a caixa do
 * consentimento marcada, regista primeiro que o cliente autorizou as fotografias.
 */
export async function novaNotaTecnica(formulario: FormData): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  const grelha = await lerGrelha(contexto.barbearia.id);
  if (!grelha.ativas.has("ficha_tecnica")) return { ok: false, erro: "erro" };
  const clienteId = String(formulario.get("clienteId") ?? "");
  const marcacaoId = String(formulario.get("marcacaoId") ?? "") || null;
  if (!uuid.safeParse(clienteId).success) return { ok: false, erro: "erro" };
  if (marcacaoId && !uuid.safeParse(marcacaoId).success) return { ok: false, erro: "erro" };
  const nota = textoLivre(formulario, "nota");
  const notaCliente = textoLivre(formulario, "notaCliente");
  const ficheiros = ["foto", "foto2"].flatMap((c) => {
    const f = formulario.get(c);
    return f instanceof File && f.size > 0 ? [f] : [];
  });
  if (!nota && !notaCliente && ficheiros.length === 0) return { ok: false, erro: "nota" };
  const fotos: FotoNova[] = [];
  for (const f of ficheiros) {
    const extensao = FOTO_FICHA.tipos[f.type];
    if (!extensao || f.size > FOTO_FICHA.maxBytes) return { ok: false, erro: "foto" };
    fotos.push({ dados: await f.arrayBuffer(), tipo: f.type, extensao });
  }
  const bd = await criarClienteServidor();
  if (formulario.get("consentimento") === "on")
    await registarConsentimentoFotos(bd, contexto.barbearia.id, clienteId);
  const r = await criarNotaTecnica(bd, {
    inquilinoId: contexto.barbearia.id,
    clienteId,
    profissionalId: contexto.profissionalId,
    marcacaoId,
    nota,
    notaCliente,
    visivelCliente: formulario.get("visivel") === "on",
    fotos,
    criadoPor: contexto.userId,
  });
  revalidatePath("/app", "layout");
  return r === true ? { ok: true } : { ok: false, erro: r };
}

/** Mostrar ou esconder uma entrada do histórico na área do cliente. */
export async function mostrarNota(id: string, visivel: boolean): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await mudarVisibilidadeNota(
    await criarClienteServidor(),
    contexto.barbearia.id,
    id,
    !!visivel,
  );
  revalidatePath("/app", "layout");
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function apagarNota(id: string): Promise<Resultado> {
  const contexto = await exigirEquipaParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await apagarNotaTecnica(await criarClienteServidor(), contexto.barbearia.id, id);
  revalidatePath("/app", "layout");
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}
