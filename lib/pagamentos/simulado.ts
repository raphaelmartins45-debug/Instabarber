import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { AdaptadorPagamentos, EstadoPagamento, EventoPagamento } from "./tipos";

// Adaptador «simulado» (G.4): o único na versão 1, para os testes. Não fala com ninguém; os
// eventos assinam-se com HMAC-SHA256, como fariam os fornecedores reais.

const ESTADOS: readonly EstadoPagamento[] = [
  "pendente",
  "pago",
  "falhou",
  "expirado",
  "reembolsado",
];

export function assinarSimulado(corpo: string, segredo: string): string {
  return createHmac("sha256", segredo).update(corpo).digest("hex");
}

export function adaptadorSimulado(segredo: string): AdaptadorPagamentos {
  const estados = new Map<string, EstadoPagamento>();
  return {
    fornecedor: "simulado",
    async pedir() {
      const idExterno = `sim_${randomUUID()}`;
      estados.set(idExterno, "pendente");
      return { idExterno, estado: "pendente" };
    },
    async consultar(id) {
      return estados.get(id) ?? "expirado";
    },
    lerWebhook(corpo, assinatura): EventoPagamento | null {
      if (!assinatura) return null;
      const esperada = Buffer.from(assinarSimulado(corpo, segredo));
      const recebida = Buffer.from(assinatura);
      if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return null;
      try {
        const e = JSON.parse(corpo) as Partial<EventoPagamento>;
        if (typeof e.idExterno !== "string" || !ESTADOS.includes(e.estado as EstadoPagamento))
          return null;
        return { idExterno: e.idExterno, estado: e.estado as EstadoPagamento };
      } catch {
        return null;
      }
    },
    async reembolsar(id) {
      estados.set(id, "reembolsado");
      return "reembolsado";
    },
  };
}
