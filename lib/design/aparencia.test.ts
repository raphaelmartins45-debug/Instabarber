import { describe, expect, it } from "vitest";
import { APARENCIA_OMISSAO, lerAparencia, modoEfetivo } from "./aparencia";

describe("aparência dos painéis (D-134)", () => {
  it("sem nada guardado, Sistema e Ouro", () => {
    expect(lerAparencia(null)).toEqual(APARENCIA_OMISSAO);
    expect(APARENCIA_OMISSAO).toEqual({ modo: "sistema", destaque: "ouro" });
  });
  it("lê o que foi guardado e ignora valores estranhos", () => {
    expect(lerAparencia('{"modo":"claro","destaque":"neon"}')).toEqual({
      modo: "claro",
      destaque: "neon",
    });
    expect(lerAparencia('{"modo":"roxo","destaque":"marca"}')).toEqual({
      modo: "sistema",
      destaque: "marca",
    });
    expect(lerAparencia("não é json")).toEqual(APARENCIA_OMISSAO);
  });
  it("«sistema» segue o aparelho", () => {
    expect(modoEfetivo("sistema", true)).toBe("claro");
    expect(modoEfetivo("sistema", false)).toBe("escuro");
    expect(modoEfetivo("escuro", true)).toBe("escuro");
  });
});
