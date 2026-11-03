import { describe, expect, it } from "vitest";
import { botaoDoCorpo, coresDaCapa } from "./cores-capa";

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

describe("botaoDoCorpo", () => {
  it("uma cor viva fica no botão, com texto legível", () => {
    const b = botaoDoCorpo("#B3261E");
    expect(b.fundo).toBe("#B3261E");
    expect(b.tinta).toBe("#FFFFFF");
  });
  it("uma cor quase branca passa a escuro, para o botão se ver no corpo claro", () => {
    expect(botaoDoCorpo("#F4F1EA").fundo).toBe("#161412");
  });
});
