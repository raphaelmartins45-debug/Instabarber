import type { AdaptadorFaturacao } from "./tipos";

// Adaptador «simulado» (G.4): numeração sequencial em memória, para os testes.
export function faturacaoSimulada(): AdaptadorFaturacao {
  let n = 0;
  const anulados = new Set<string>();
  return {
    fornecedor: "simulado",
    async emitir() {
      n += 1;
      return { numero: `SIM ${String(n).padStart(4, "0")}` };
    },
    async anular(numero) {
      if (anulados.has(numero)) return false;
      anulados.add(numero);
      return true;
    },
  };
}
