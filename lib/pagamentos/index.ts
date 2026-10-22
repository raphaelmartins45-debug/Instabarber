import "server-only";
import { marcarCicloPago } from "@/lib/repositorios/painel/clube";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { adaptadorSimulado } from "./simulado";
import type { AdaptadorPagamentos } from "./tipos";

// A interface que o núcleo chama (G.4). Com o módulo desligado — sempre, na versão 1 — usa o
// adaptador «manual», que faz exatamente o que a versão 1 faz: regista o dinheiro recebido ao
// balcão. Nada mais no sistema depende deste módulo.

export type Recebimento = {
  finalidade: "clube";
  inquilinoId: string;
  referenciaId: string;
  metodo: "dinheiro" | "mbway" | "transferencia" | "cartao";
};

/** Adaptador «manual»: o recebimento fica registado; não há cobrança. */
async function registarManual(bd: ClienteBD, r: Recebimento): Promise<boolean> {
  return marcarCicloPago(bd, r.inquilinoId, r.referenciaId, r.metodo);
}

export async function registarRecebimento(bd: ClienteBD, r: Recebimento): Promise<boolean> {
  return registarManual(bd, r);
}

/** O adaptador do fornecedor configurado; nulo enquanto não houver contrato (D-05). */
export function adaptadorConfigurado(
  ambiente: Record<string, string | undefined> = process.env,
): AdaptadorPagamentos | null {
  const segredo = ambiente.PAGAMENTOS_SEGREDO_WEBHOOK;
  if (ambiente.PAGAMENTOS_FORNECEDOR === "simulado" && segredo) return adaptadorSimulado(segredo);
  return null;
}
