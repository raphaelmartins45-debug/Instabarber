import { describe, expect, it } from "vitest";
import { BRANCO, corDoTexto, PRETO, razaoContraste } from "./contraste";

describe("contraste da capa", () => {
  it("dourado claro leva texto preto; azul-escuro leva branco", () => {
    expect(corDoTexto("#F5A623")).toBe(PRETO);
    expect(corDoTexto("#1428C8")).toBe(BRANCO);
  });
  it("a cor escolhida passa sempre os 4,5:1", () => {
    for (const c of ["#F5A623", "#1428C8", "#777777", "#808080", "#00FF00", "#C0392B"]) {
      expect(razaoContraste(c, corDoTexto(c))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
