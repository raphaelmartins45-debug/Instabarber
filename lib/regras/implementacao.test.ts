import { describe, expect, it } from "vitest";
import { implementacaoPorPagarCent } from "./implementacao";

describe("implementação por pagar (D-189)", () => {
  it("sem implementação ou já paga, é zero", () => {
    expect(implementacaoPorPagarCent({}, "isento")).toBe(0);
    expect(
      implementacaoPorPagarCent(
        {
          implementacao: "formacao",
          implementacao_sem_iva: 100,
          implementacao_paga_em: "2026-11-03",
        },
        "isento",
      ),
    ).toBe(0);
  });
  it("por pagar: o valor sem IVA no isento, com 23 % no regime normal", () => {
    const b = { implementacao: "essencial", implementacao_sem_iva: "50.00" };
    expect(implementacaoPorPagarCent(b, "isento")).toBe(5000);
    expect(implementacaoPorPagarCent(b, "normal")).toBe(6150);
  });
});
