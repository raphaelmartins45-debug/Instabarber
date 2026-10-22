import { addDays, format } from "date-fns";

// Alertas do painel geral do Admin (E.1). Datas em AAAA-MM-DD já no fuso da região.

export type BarbeariaParaAlerta = {
  estado: string;
  estado_pagamento: string;
  proximo_vencimento: string | null;
};

export function contarAlertas(barbearias: BarbeariaParaAlerta[], hoje: string) {
  const limite = format(addDays(new Date(`${hoje}T12:00:00Z`), 7), "yyyy-MM-dd");
  const ativas = barbearias.filter((b) => b.estado === "ativo");
  return {
    atraso: ativas.filter((b) => b.estado_pagamento === "em_atraso").length,
    suspensas: barbearias.filter((b) => b.estado === "suspenso").length,
    vencimentos: ativas.filter(
      (b) => b.proximo_vencimento && b.proximo_vencimento >= hoje && b.proximo_vencimento <= limite,
    ).length,
  };
}

/** A partir de novembro, avisa se os feriados nacionais do ano seguinte não estão carregados (C.8, M.1). */
export function faltamFeriados(hoje: string, feriadosDoAnoSeguinte: number): boolean {
  return Number(hoje.slice(5, 7)) >= 11 && feriadosDoAnoSeguinte === 0;
}
