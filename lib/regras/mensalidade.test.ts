import { describe, expect, it } from "vitest";
import {
  calcularMensalidadeCent,
  calcularPrecoCent,
  comDescontoCent,
  profissionaisExtra,
} from "./mensalidade";

describe("mensalidade (D.5)", () => {
  it.each([
    ["basic", 1, 1999, 2459],
    ["pro", 3, 3999, 4919],
    ["pro", 4, 4999, 6149],
    ["pro", 5, 5999, 7379],
    ["pro", 8, 8999, 11069],
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
      semIva: 39990,
      comIva: 49188,
      ivaTaxa: 23,
    });
  });

  it("domínio próprio: +5,00 € por mês (6,15 € com IVA), em qualquer plano", () => {
    expect(calcularMensalidadeCent("basic", 1, true)).toBe(2499);
    expect(
      calcularPrecoCent("pro", 3, "mensal", true).comIva -
        calcularPrecoCent("pro", 3, "mensal").comIva,
    ).toBe(615);
    expect(calcularPrecoCent("pro", 3, "anual", true).semIva).toBe(44990);
  });

  it("no regime isento não acresce IVA: o preço final é o valor sem IVA (D-173)", () => {
    expect(calcularPrecoCent("pro", 3, "mensal", false, "isento")).toEqual({
      semIva: 3999,
      comIva: 3999,
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

describe("desconto na mensalidade (D-161)", () => {
  it("aplica-se à mensalidade antes do período e do IVA", () => {
    // Pro com 3: 39,99 € com 20 % → 31,99 € sem IVA; 39,35 € com IVA.
    expect(calcularPrecoCent("pro", 3, "mensal", false, "normal", 20)).toEqual({
      semIva: 3199,
      comIva: 3935,
      ivaTaxa: 23,
    });
    expect(calcularPrecoCent("pro", 3, "anual", false, "normal", 20).semIva).toBe(31990);
  });

  it("sem desconto o preço não muda", () => {
    expect(calcularPrecoCent("basic", 1, "mensal", false, "normal", 0)).toEqual(
      calcularPrecoCent("basic", 1, "mensal"),
    );
  });

  it("arredonda ao cêntimo e recusa percentagens inválidas", () => {
    expect(comDescontoCent(1999, 15)).toBe(1699);
    expect(() => comDescontoCent(1999, 12.5)).toThrow("desconto_invalido");
    expect(() => comDescontoCent(1999, 101)).toThrow("desconto_invalido");
  });
});
