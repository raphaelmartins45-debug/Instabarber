import { describe, expect, it } from "vitest";
import { razaoContraste } from "@/lib/regras/contraste";
import {
  ajustarDestaque,
  CARTAO_CLARO,
  CARTAO_ESCURO,
  corValida,
  FUNDO_CLARO,
  FUNDO_ESCURO,
  misturar,
  variaveisMarca,
} from "./cor";

// A cor de marca nunca fica ilegível (D-134): 12 cores típicas, nos dois modos.
const CORES = [
  "#000000",
  "#FFFFFF",
  "#FFD400",
  "#F57C00",
  "#D32F2F",
  "#0B2545",
  "#4FC3F7",
  "#2E7D32",
  "#6A1B9A",
  "#EC407A",
  "#6D4C41",
  "#9E9E9E",
];

describe("ajustarDestaque", () => {
  it("devolve a própria cor quando já tem contraste", () => {
    expect(ajustarDestaque("#F5A623", FUNDO_ESCURO)).toBe("#F5A623");
  });
  it("clareia num fundo escuro e escurece num claro, até ao mínimo", () => {
    const escuro = ajustarDestaque("#0B2545", CARTAO_ESCURO);
    const claro = ajustarDestaque("#FFD400", CARTAO_CLARO);
    expect(razaoContraste(escuro, CARTAO_ESCURO)).toBeGreaterThanOrEqual(4.5);
    expect(razaoContraste(claro, CARTAO_CLARO)).toBeGreaterThanOrEqual(4.5);
    expect(escuro).not.toBe("#FFFFFF");
    expect(claro).not.toBe("#000000");
  });
});

describe("variaveisMarca", () => {
  for (const cor of CORES)
    it(`${cor}: botão, texto sobre o botão e ligações legíveis nos dois modos`, () => {
      const v = variaveisMarca(cor);
      expect(razaoContraste(v["--marca-escuro"]!, FUNDO_ESCURO)).toBeGreaterThanOrEqual(3);
      expect(razaoContraste(v["--marca-claro"]!, FUNDO_CLARO)).toBeGreaterThanOrEqual(3);
      expect(
        razaoContraste(v["--marca-escuro-sobre"]!, v["--marca-escuro"]!),
      ).toBeGreaterThanOrEqual(4.5);
      expect(razaoContraste(v["--marca-claro-sobre"]!, v["--marca-claro"]!)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(razaoContraste(v["--marca-escuro-texto"]!, CARTAO_ESCURO)).toBeGreaterThanOrEqual(4.5);
      expect(razaoContraste(v["--marca-claro-texto"]!, CARTAO_CLARO)).toBeGreaterThanOrEqual(4.5);
      expect(v["--marca-escuro-rgb"]).toMatch(/^\d+,\d+,\d+$/);
    });
});

describe("auxiliares", () => {
  it("valida hexadecimais de seis dígitos e mistura cores", () => {
    expect(corValida("#12AB9f")).toBe(true);
    expect(corValida("vermelho")).toBe(false);
    expect(corValida(null)).toBe(false);
    expect(misturar("#000000", "#FFFFFF", 0.5)).toBe("#808080");
  });
});
