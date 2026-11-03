import { describe, expect, it } from "vitest";
import { fundoDoLogo, paletaDePixeis } from "./paleta";

const px = (r: number, g: number, b: number, a = 255, n = 1) =>
  Array.from({ length: n }, () => [r, g, b, a]).flat();

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
    expect(paletaDePixeis([...px(100, 0, 0), ...px(0, 100, 0), ...px(0, 0, 100)], 2)).toHaveLength(
      2,
    );
  });
});

describe("fundoDoLogo", () => {
  // Imagem 4×4: orla de uma cor e miolo de outra.
  const imagem = (orla: number[], miolo: number[], alfa = 255) => {
    const p: number[] = [];
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const dentro = x > 0 && y > 0 && x < 3 && y < 3;
        p.push(...(dentro ? miolo : orla), alfa);
      }
    return p;
  };
  it("a orla preta do logótipo dá o fundo preto", () => {
    expect(fundoDoLogo(imagem([10, 10, 10], [200, 160, 40]), 4, 4)).toBe("#0A0A0A");
  });
  it("fundo transparente: nulo (fica a cor da barbearia)", () => {
    expect(fundoDoLogo(imagem([10, 10, 10], [200, 160, 40], 0), 4, 4)).toBeNull();
  });
  it("orla com várias cores: nulo", () => {
    const p = imagem([10, 10, 10], [200, 160, 40]);
    for (let i = 0; i < 6 * 4; i += 4) [p[i], p[i + 1], p[i + 2]] = [250, 250, 250];
    expect(fundoDoLogo(p, 4, 4)).toBeNull();
  });
});
