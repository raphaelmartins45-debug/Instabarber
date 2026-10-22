import { describe, expect, it } from "vitest";
import { centimosDeNumeric, formatarDinheiro, numericDeCentimos } from "./dinheiro";

const espaco = " ";

describe("dinheiro", () => {
  it("converte numeric(10,2) em cêntimos inteiros", () => {
    expect(centimosDeNumeric("47.97")).toBe(4797);
    expect(centimosDeNumeric("12.3")).toBe(1230);
    expect(centimosDeNumeric("39")).toBe(3900);
    expect(centimosDeNumeric("-0.05")).toBe(-5);
  });

  it("aceita o numeric como número JSON, sem erro de vírgula flutuante", () => {
    expect(centimosDeNumeric(15)).toBe(1500);
    expect(centimosDeNumeric(47.97)).toBe(4797);
    expect(centimosDeNumeric(0.1)).toBe(10);
    expect(centimosDeNumeric(99999999.99)).toBe(9999999999);
  });

  it("converte cêntimos em numeric(10,2)", () => {
    expect(numericDeCentimos(4797)).toBe("47.97");
    expect(numericDeCentimos(5)).toBe("0.05");
    expect(numericDeCentimos(-1230)).toBe("-12.30");
  });

  it("ida e volta não perde cêntimos", () => {
    for (const c of [0, 1, 99, 100, 2459, 24588, 99999999]) {
      expect(centimosDeNumeric(numericDeCentimos(c))).toBe(c);
    }
  });

  it("formata em euros, à portuguesa", () => {
    expect(formatarDinheiro(1230)).toBe(`12,30${espaco}€`);
    expect(formatarDinheiro(47970)).toBe(`479,70${espaco}€`);
  });

  it("recusa valores inválidos", () => {
    expect(() => centimosDeNumeric("12,30")).toThrow();
    expect(() => centimosDeNumeric("1.234")).toThrow();
    expect(() => numericDeCentimos(12.5)).toThrow();
    expect(() => formatarDinheiro(0.5)).toThrow();
  });
});
