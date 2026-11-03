import { describe, expect, it } from "vitest";
import { coresDaCapa } from "./cores-capa";

describe("coresDaCapa", () => {
  it("logótipo de fundo preto: a capa fica preta e o botão tem a cor da barbearia", () => {
    const c = coresDaCapa("#D4A017", "#0A0A0A");
    expect(c.fundo).toBe("#0A0A0A");
    expect(c.destaque).toBe("#D4A017");
  });
  it("sem fundo no logótipo, a capa tem a cor da barbearia e o botão a cor do texto", () => {
    const c = coresDaCapa("#12100E", null);
    expect(c.fundo).toBe("#12100E");
    expect(c.destaque).toBe(c.tinta);
    expect(c.tintaDestaque).toBe(c.fundo === c.tintaDestaque ? c.fundo : c.tintaDestaque);
  });
  it("a cor da barbearia igual à do fundo do logótipo: o botão usa a cor do texto", () => {
    const c = coresDaCapa("#111111", "#0A0A0A");
    expect(c.destaque).toBe(c.tinta);
  });
});
