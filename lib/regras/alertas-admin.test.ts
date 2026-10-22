import { describe, expect, it } from "vitest";
import { contarAlertas, faltamFeriados } from "./alertas-admin";

describe("alertas do painel geral", () => {
  it("atraso, suspensas e vencimentos nos próximos 7 dias", () => {
    const r = contarAlertas(
      [
        { estado: "ativo", estado_pagamento: "em_atraso", proximo_vencimento: "2026-10-25" },
        { estado: "ativo", estado_pagamento: "em_dia", proximo_vencimento: "2026-11-05" },
        { estado: "suspenso", estado_pagamento: "em_atraso", proximo_vencimento: null },
      ],
      "2026-10-22",
    );
    expect(r).toEqual({ atraso: 1, suspensas: 1, vencimentos: 1 });
  });

  it("feriados do ano seguinte: só a partir de novembro", () => {
    expect(faltamFeriados("2026-10-22", 0)).toBe(false);
    expect(faltamFeriados("2026-11-01", 0)).toBe(true);
    expect(faltamFeriados("2026-11-01", 13)).toBe(false);
  });
});
