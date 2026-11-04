import { describe, expect, it } from "vitest";
import { razaoContraste } from "@/lib/regras/contraste";
import { ESTILOS, MODELOS, estiloDe } from "./estilos";

describe("estiloDe", () => {
  it("valores desconhecidos ficam no primeiro modelo; há oito modelos", () => {
    expect(estiloDe("neon")).toBe("monumento");
    expect(estiloDe(null)).toBe("monumento");
    expect(estiloDe("vitrine")).toBe("vitrine");
    expect(ESTILOS).toHaveLength(8);
  });
});

describe("MODELOS", () => {
  it("não há dois modelos iguais na organização (D-200)", () => {
    const chaves = ESTILOS.map((e) => {
      const m = MODELOS[e];
      return `${m.cabecalho}|${m.corpo}|${m.servicos}|${m.raio}`;
    });
    expect(new Set(chaves).size).toBe(ESTILOS.length);
  });
});

describe("paletas dos modelos (D-201)", () => {
  it("o texto, o texto secundário e os botões passam o contraste AA", () => {
    for (const e of ESTILOS) {
      const p = MODELOS[e].paleta;
      expect(razaoContraste(p.texto, p.fundo), e).toBeGreaterThanOrEqual(4.5);
      expect(razaoContraste(p.texto2, p.cartao), e).toBeGreaterThanOrEqual(4.5);
      expect(razaoContraste(p.sobreDestaque, p.destaque), e).toBeGreaterThanOrEqual(4.5);
      expect(razaoContraste(p.sobreRodape, p.rodape), e).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("as oito paletas são diferentes", () => {
    expect(new Set(ESTILOS.map((e) => MODELOS[e].paleta.destaque)).size).toBe(8);
  });
});
