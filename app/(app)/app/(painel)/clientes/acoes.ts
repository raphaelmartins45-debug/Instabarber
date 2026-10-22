"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirEquipaParaEscrever } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { registarMensagemAberta } from "@/lib/repositorios/painel/mensagens";
import { criarClienteServidor } from "@/lib/supabase/servidor";

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
