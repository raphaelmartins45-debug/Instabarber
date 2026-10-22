import { describe, expect, it } from "vitest";
import { paletaDePixeis } from "./paleta";

const px = (r: number, g: number, b: number, a = 255, n = 1) => Array.from({ length: n }, () => [r, g, b, a]).flat();

describe("paletaDePixeis", () => {
  it("devolve as cores mais frequentes, sem transparente, branco nem preto", () => {
    const pixeis = [
      ...px(245, 166, 35, 255, 10),
      ...px(20, 40, 200, 255, 5),
      ...px(255, 255, 255, 255, 50),
      ...px(0, 0, 0, 255, 50),
      ...px(200, 10, 10, 0, 50),
    ];
    expect(paletaDePixeis(pixeis)).toEqual(["#F5A623", "#1428C8"]);
  });
  it("limita o número de cores", () => {
    expect(paletaDePixeis([...px(100, 0, 0), ...px(0, 100, 0), ...px(0, 0, 100)], 2)).toHaveLength(2);
  });
});
