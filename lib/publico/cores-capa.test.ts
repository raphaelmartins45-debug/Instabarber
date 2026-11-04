import { describe, expect, it } from "vitest";
import { coresDaCapa } from "./cores-capa";

describe("coresDaCapa", () => {
  it("cabeçalho preto: o botão tem o destaque do modelo", () => {
    const c = coresDaCapa("#C9A24A", "#0A0A0A");
    expect(c.fundo).toBe("#0A0A0A");
    expect(c.destaque).toBe("#C9A24A");
  });
  it("destaque igual ao fundo do cabeçalho: o botão usa a cor do texto", () => {
    const c = coresDaCapa("#111111", "#0A0A0A");
    expect(c.destaque).toBe(c.tinta);
  });
});
