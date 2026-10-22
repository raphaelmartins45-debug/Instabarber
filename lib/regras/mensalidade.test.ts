import { describe, expect, it } from "vitest";
import { calcularMensalidadeCent, calcularPrecoCent, profissionaisExtra } from "./mensalidade";

describe("mensalidade (D.5)", () => {
  it.each([
    ["basic", 1, 1999, 2459],
    ["pro", 3, 3900, 4797],
    ["pro", 4, 4900, 6027],
    ["pro", 5, 5900, 7257],
    ["pro", 8, 8900, 10947],
  ] as const)("%s com %i profissionais: %i / %i cêntimos", (plano, n, semIva, comIva) => {
    expect(calcularPrecoCent(plano, n, "mensal")).toEqual({ semIva, comIva, ivaTaxa: 23 });
  });

  it("o anual são 10 mensalidades (CLAUDE.md §6)", () => {
    expect(calcularPrecoCent("basic", 1, "anual")).toEqual({
      semIva: 19990,
      comIva: 24588,
      ivaTaxa: 23,
    });
    expect(calcularPrecoCent("pro", 3, "anual")).toEqual({
      semIva: 39000,
      comIva: 47970,
      ivaTaxa: 23,
    });
  });

  it("domínio próprio: +5,00 € por mês (6,15 € com IVA), em qualquer plano", () => {
    expect(calcularMensalidadeCent("basic", 1, true)).toBe(2499);
    expect(
      calcularPrecoCent("pro", 3, "mensal", true).comIva -
        calcularPrecoCent("pro", 3, "mensal").comIva,
    ).toBe(615);
    expect(calcularPrecoCent("pro", 3, "anual", true).semIva).toBe(44000);
  });

  it("no regime isento o preço final não muda e o valor sem IVA é igual a ele (D-45)", () => {
    expect(calcularPrecoCent("pro", 3, "mensal", false, "isento")).toEqual({
      semIva: 4797,
      comIva: 4797,
      ivaTaxa: 0,
    });
  });

  it("recusa combinações impossíveis", () => {
    expect(() => calcularMensalidadeCent("basic", 2)).toThrow("basic_um_profissional");
    expect(() => calcularMensalidadeCent("pro", 2)).toThrow("pro_minimo_tres");
    expect(() => calcularMensalidadeCent("pro", 3.5)).toThrow("profissionais_invalido");
  });

  it("a conta dos extras (D.6): 5 profissionais = 2 extra a 10,00 €", () => {
    expect(profissionaisExtra("pro", 5)).toEqual({ extras: 2, valorCent: 2000 });
    expect(profissionaisExtra("basic", 1)).toEqual({ extras: 0, valorCent: 0 });
  });
});
