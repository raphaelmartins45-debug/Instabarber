import { describe, expect, it } from "vitest";
import { estadoStock, margemProduto, receitaLojaSemIva } from "./loja";

describe("loja", () => {
  it("margem do exemplo da F.4.4", () => {
    expect(margemProduto(650, 1200, 23)).toEqual({
      semIvaCent: 976,
      margemCent: 326,
      percentagem: 33.4,
      negativa: false,
    });
  });
  it("margem negativa avisa", () => {
    expect(margemProduto(1000, 1200, 23).negativa).toBe(true);
  });
  it("estado do stock", () => {
    expect(estadoStock(0, 2)).toBe("esgotado");
    expect(estadoStock(2, 2)).toBe("repor");
    expect(estadoStock(3, 2)).toBe("em_stock");
  });
  it("receita sem IVA das linhas levantadas", () => {
    expect(
      receitaLojaSemIva([
        { precoUnitarioCent: 1230, quantidade: 2, ivaPercent: 23 },
        { precoUnitarioCent: 1060, quantidade: 1, ivaPercent: 6 },
      ]),
    ).toBe(3000);
  });
});
