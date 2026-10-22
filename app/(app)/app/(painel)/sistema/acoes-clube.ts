"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaParaEscrever, exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import { centimosDeTexto } from "@/lib/formatacao/dinheiro";
import { telefoneE164 } from "@/lib/formatacao/telefone";
import { anularCartao, venderCartao } from "@/lib/repositorios/painel/cartoes";
import { procurarPorTelefone } from "@/lib/repositorios/painel/clientes";
import {
  cancelarSubscricao,
  gravarPlano,
  inscrever,
  renovar,
} from "@/lib/repositorios/painel/clube";
import { registarRecebimento } from "@/lib/pagamentos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaPlano } from "@/lib/validacao/sistema";

// Clube de assinatura (F.4.2) e cartões oferta (F.4.9). O pagamento regista-se, não se cobra.

export type Resultado = { ok: true } | { ok: false; erro: string };

const uuid = z.string().uuid();

function revalidar() {
  revalidatePath("/app", "layout");
}

export async function guardarPlano(
  id: string | null,
  dados: z.input<typeof esquemaPlano>,
): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaPlano.safeParse(dados);
  if ((id !== null && !uuid.safeParse(id).success) || !v.success)
    return { ok: false, erro: v.error?.issues[0]?.message ?? "erro" };
  const ok = await gravarPlano(await criarClienteServidor(), contexto.barbearia.id, id, v.data);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function inscreverCliente(
  telefone: string,
  planoId: string,
  inicio: string,
): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const e164 = telefoneE164(telefone);
  if (!e164 || !uuid.safeParse(planoId).success || !/^\d{4}-\d{2}-\d{2}$/.test(inicio))
    return { ok: false, erro: "cliente" };
  const bd = await criarClienteServidor();
  const cliente = await procurarPorTelefone(bd, contexto.barbearia.id, e164);
  if (!cliente) return { ok: false, erro: "cliente" };
  const r = await inscrever(bd, cliente.id, planoId, inicio);
  revalidar();
  return r.ok ? { ok: true } : { ok: false, erro: r.motivo };
}

export async function pagarCiclo(cicloId: string, metodo: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const m = z.enum(["dinheiro", "mbway", "transferencia", "cartao"]).safeParse(metodo);
  if (!uuid.safeParse(cicloId).success || !m.success) return { ok: false, erro: "erro" };
  // O núcleo regista pela interface dos pagamentos (G.4); desligada, só regista.
  const ok = await registarRecebimento(await criarClienteServidor(), {
    finalidade: "clube",
    inquilinoId: contexto.barbearia.id,
    referenciaId: cicloId,
    metodo: m.data,
  });
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function renovarCiclo(id: string): Promise<Resultado> {
  await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await renovar(await criarClienteServidor(), id);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function cancelar(id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await cancelarSubscricao(await criarClienteServidor(), contexto.barbearia.id, id);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

const esquemaVenda = z.object({
  valor: z.string(),
  comprador: z.string().trim().min(1, "nome").max(80),
  beneficiario: z.string().trim().max(80),
  metodo: z.enum(["dinheiro", "mbway", "transferencia", "cartao"]),
  validoAte: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]),
});

/** Vender um cartão oferta (F.4.9): pago ao balcão; o código gera-se na base de dados. */
export async function venderCartaoOferta(
  dados: z.input<typeof esquemaVenda>,
): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  const contexto = await exigirEquipaParaEscrever();
  const v = esquemaVenda.safeParse(dados);
  const valorCent = v.success ? centimosDeTexto(v.data.valor) : null;
  if (!v.success || !valorCent)
    return { ok: false, erro: v.success ? "valor" : (v.error.issues[0]?.message ?? "erro") };
  const r = await venderCartao(await criarClienteServidor(), {
    inquilinoId: contexto.barbearia.id,
    valorCent,
    comprador: v.data.comprador,
    beneficiario: v.data.beneficiario || null,
    metodo: v.data.metodo,
    validoAte: v.data.validoAte || null,
  });
  revalidar();
  return r.ok ? { ok: true, id: r.id } : { ok: false, erro: r.motivo };
}

export async function anular(id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "erro" };
  const ok = await anularCartao(await criarClienteServidor(), contexto.barbearia.id, id);
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}
