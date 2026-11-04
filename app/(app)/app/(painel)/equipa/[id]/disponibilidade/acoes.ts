"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaParaEscrever } from "@/lib/equipa/contexto";
import { instanteLocal } from "@/lib/formatacao/datas";
import {
  criarAusencia,
  marcacoesNoPeriodo,
  removerAusencia,
  type MarcacaoNoPeriodo,
} from "@/lib/repositorios/painel/calendario";
import { gravarHorario } from "@/lib/repositorios/painel/horarios";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaBloqueio, esquemaHorarioBarbeiro } from "@/lib/validacao/sistema";

// A disponibilidade do barbeiro (D-202): o próprio, ou o gestor. O RLS limita o barbeiro ao seu
// horário e às horas que ele próprio bloqueou; a base de dados recusa bloqueios por cima de
// marcações e horários fora do da barbearia.

export type Resultado = { ok: true } | { ok: false; erro: string };
export type ResultadoBloqueio =
  | Resultado
  | { ok: false; erro: string; conflitos: MarcacaoNoPeriodo[] };

const uuid = z.guid();

async function autorizar(profissionalId: string) {
  const contexto = await exigirEquipaParaEscrever();
  if (!uuid.safeParse(profissionalId).success) return null;
  if (!contexto.eGestor && contexto.profissionalId !== profissionalId) return null;
  return contexto;
}

function revalidar(id: string) {
  revalidatePath(`/app/equipa/${id}`, "layout");
  revalidatePath("/app/agenda");
}

export async function guardarMeuHorario(
  id: string,
  linhas: z.input<typeof esquemaHorarioBarbeiro>,
): Promise<Resultado> {
  const contexto = await autorizar(id);
  const v = esquemaHorarioBarbeiro.safeParse(linhas);
  if (!contexto || !v.success) return { ok: false, erro: "horario" };
  const erro = await gravarHorario(await criarClienteServidor(), contexto.barbearia.id, id, v.data);
  revalidar(id);
  return erro ? { ok: false, erro } : { ok: true };
}

export async function bloquearHoras(
  id: string,
  dados: z.input<typeof esquemaBloqueio>,
): Promise<ResultadoBloqueio> {
  const contexto = await autorizar(id);
  const v = esquemaBloqueio.safeParse(dados);
  if (!contexto) return { ok: false, erro: "erro" };
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const periodo = {
    inicio: instanteLocal(v.data.dia, v.data.de).toISOString(),
    fim: instanteLocal(v.data.dia, v.data.ate).toISOString(),
  };
  const bd = await criarClienteServidor();
  const erro = await criarAusencia(bd, {
    inquilinoId: contexto.barbearia.id,
    profissionalId: id,
    ...periodo,
    tipo: "bloqueio",
    motivo: v.data.motivo,
    criadoPor: contexto.userId,
  });
  if (erro === "marcacoes_no_periodo")
    return {
      ok: false,
      erro,
      conflitos: await marcacoesNoPeriodo(bd, contexto.barbearia.id, id, periodo),
    };
  revalidar(id);
  return erro ? { ok: false, erro } : { ok: true };
}

export async function desbloquear(id: string, ausenciaId: string): Promise<Resultado> {
  const contexto = await autorizar(id);
  if (!contexto || !uuid.safeParse(ausenciaId).success) return { ok: false, erro: "erro" };
  const ok = await removerAusencia(await criarClienteServidor(), contexto.barbearia.id, ausenciaId);
  revalidar(id);
  return ok ? { ok: true } : { ok: false, erro: "erro" };
}
