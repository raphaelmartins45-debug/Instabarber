import { describe, expect, it } from "vitest";
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
