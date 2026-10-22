"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { carregarImagemPublica } from "@/lib/repositorios/painel/imagens";
import { gravarProduto, levantarPedido, mudarEstadoPedido } from "@/lib/repositorios/painel/loja";
import { registarMensagemAberta } from "@/lib/repositorios/painel/mensagens";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaProduto } from "@/lib/validacao/sistema";

// Loja (F.4.4), no painel do gestor. O stock só desconta ao levantar (levantar_pedido()).

export type Resultado = { ok: true } | { ok: false; erro: string };

const uuid = z.string().uuid();

async function exigirLoja() {
  const contexto = await exigirGestorParaEscrever();
  if (!(await lerGrelha(contexto.barbearia.id)).ativas.has("loja_produtos"))
    throw new Error("loja_inativa");
  return contexto;
}

function revalidar() {
  revalidatePath("/app", "layout");
}

/** Produto novo ou alterado, com fotografia opcional (JPG ou WEBP, até 3 MB). */
export async function guardarProduto(formulario: FormData): Promise<Resultado> {
  const contexto = await exigirLoja();
  const id = String(formulario.get("id") ?? "");
  const v = esquemaProduto.safeParse({
    nome: String(formulario.get("nome") ?? ""),
    descricao: String(formulario.get("descricao") ?? ""),
    custoCent: String(formulario.get("custo") ?? ""),
    ivaPercent: String(formulario.get("iva") ?? "23"),
    precoCent: String(formulario.get("preco") ?? ""),
    stock: String(formulario.get("stock") ?? "0"),
    stockMinimo: String(formulario.get("stockMinimo") ?? "0"),
    mostrarEsgotado: formulario.get("mostrarEsgotado") === "on",
    ativo: formulario.get("ativo") === "on",
  });
  if ((id && !uuid.safeParse(id).success) || !v.success)
    return { ok: false, erro: v.error?.issues[0]?.message ?? "erro" };
  const bd = await criarClienteServidor();
  const ficheiro = formulario.get("foto");
  let fotoUrl: string | undefined;
  if (ficheiro instanceof File && ficheiro.size > 0) {
    if (!["image/jpeg", "image/webp"].includes(ficheiro.type)) return { ok: false, erro: "foto" };
    fotoUrl =
      (await carregarImagemPublica(bd, `${contexto.barbearia.id}/loja`, ficheiro)) ?? undefined;
    if (!fotoUrl) return { ok: false, erro: "foto" };
  }
  const ok = await gravarProduto(bd, contexto.barbearia.id, id || null, { ...v.data, fotoUrl });
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function marcarPronto(id: string): Promise<Resultado> {
  const contexto = await exigirLoja();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await mudarEstadoPedido(
    await criarClienteServidor(),
    contexto.barbearia.id,
    id,
    "pronto",
  );
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "pedido_invalido" };
}

export async function cancelarPedido(id: string): Promise<Resultado> {
  const contexto = await exigirLoja();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await mudarEstadoPedido(
    await criarClienteServidor(),
    contexto.barbearia.id,
    id,
    "cancelado",
  );
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "pedido_invalido" };
}

export async function levantado(id: string): Promise<Resultado> {
  await exigirLoja();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const r = await levantarPedido(await criarClienteServidor(), id);
  revalidar();
  return r.ok ? { ok: true } : { ok: false, erro: r.motivo };
}

/** «Avisar»: regista o aviso de pedido pronto aberto por wa.me (mensagem de serviço). */
export async function avisoAberto(
  pedidoId: string,
  clienteId: string,
  conteudo: string,
): Promise<Resultado> {
  const contexto = await exigirLoja();
  if (!uuid.safeParse(pedidoId).success || !uuid.safeParse(clienteId).success)
    return { ok: false, erro: "erro" };
  const ok = await registarMensagemAberta(await criarClienteServidor(), {
    inquilinoId: contexto.barbearia.id,
    clienteId,
    profissionalId: contexto.profissionalId,
    tipo: "loja",
    conteudo: conteudo.slice(0, 2000),
    referenciaId: pedidoId,
    criadoPor: contexto.userId,
  });
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}
