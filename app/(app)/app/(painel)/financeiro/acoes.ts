"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import { mesmoDiaMesSeguinte } from "@/lib/formatacao/datas";
import { acertosDoMes } from "@/lib/painel/acertos";
import { registarAcerto } from "@/lib/repositorios/painel/acertos";
import { criarConta, marcarPaga, removerConta } from "@/lib/repositorios/painel/financeiro";
import { gravarObjetivo } from "@/lib/repositorios/painel/objetivos";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaAcerto, esquemaConta, esquemaObjetivo } from "@/lib/validacao/financeiro";

// Financeiro da barbearia (E.2): só o gestor.

export type Resultado = { ok: true } | { ok: false; erro: string };

const tipo = z.enum(["custo", "despesa"]);
const uuid = z.string().uuid();

function revalidar() {
  revalidatePath("/app", "layout");
}

export async function paguei(t: string, id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = z.object({ t: tipo, id: uuid }).safeParse({ t, id });
  if (!v.success) return { ok: false, erro: "erro" };
  const ok = await marcarPaga(
    await criarClienteServidor(),
    contexto.barbearia.id,
    v.data.t,
    v.data.id,
    mesmoDiaMesSeguinte,
  );
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function remover(t: string, id: string): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = z.object({ t: tipo, id: uuid }).safeParse({ t, id });
  if (!v.success) return { ok: false, erro: "erro" };
  const ok = await removerConta(
    await criarClienteServidor(),
    contexto.barbearia.id,
    v.data.t,
    v.data.id,
  );
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function novaConta(dados: z.input<typeof esquemaConta>): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaConta.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const ok = await criarConta(await criarClienteServidor(), contexto.barbearia.id, {
    tipo: v.data.tipo,
    descricao: v.data.descricao,
    valorCent: v.data.valor,
    data: v.data.data,
    recorrente: v.data.recorrente,
    categoria: v.data.categoria,
  });
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

export async function guardarObjetivo(dados: z.input<typeof esquemaObjetivo>): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaObjetivo.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const ok = await gravarObjetivo(await criarClienteServidor(), contexto.barbearia.id, {
    profissionalId: v.data.profissionalId,
    mes: v.data.mes,
    valorCent: v.data.valor,
  });
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}

/**
 * «Registar acerto» (F.4.11): o primeiro do mês leva o retrato do acerto (tipo normal); os
 * seguintes são correções. O sentido diz quem pagou a quem.
 */
export async function registarAcertoMes(
  dados: z.input<typeof esquemaAcerto> & { sentido: string },
): Promise<Resultado> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquemaAcerto.safeParse(dados);
  const sentido = z.enum(["a_pagar", "a_receber"]).safeParse(dados.sentido);
  if (!v.success || !sentido.success)
    return { ok: false, erro: v.error?.issues[0]?.message ?? "erro" };
  const bd = await criarClienteServidor();
  const anoMes = v.data.mes.slice(0, 7);
  const { linhas } = await acertosDoMes(bd, contexto.barbearia.id, anoMes, v.data.profissionalId);
  const linha = linhas[0];
  if (!linha) return { ok: false, erro: "erro" };
  const ok = await registarAcerto(bd, {
    inquilinoId: contexto.barbearia.id,
    profissionalId: v.data.profissionalId,
    mes: v.data.mes,
    acerto: linha,
    sentido: sentido.data,
    valorCent: v.data.valor,
    metodo: v.data.metodo,
    data: v.data.data,
    nota: v.data.nota,
    primeiro: !linha.registos.some((r) => r.tipo === "normal"),
  });
  revalidar();
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}
