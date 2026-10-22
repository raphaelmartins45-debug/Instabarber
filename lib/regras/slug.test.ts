import { describe, expect, it } from "vitest";
import { slugDoNome, slugLivre } from "./slug";

describe("slug da barbearia (L.3)", () => {
  it("tira acentos e símbolos", () => {
    expect(slugDoNome("Barbearia Conceição & Filhos")).toBe("barbearia-conceicao-e-filhos");
    expect(slugDoNome("  O Zé  ")).toBe("o-ze");
  });

  it("nunca devolve um caminho reservado nem curto demais", () => {
    expect(slugDoNome("Admin")).toBe("barbearia-admin");
    expect(slugDoNome("Zé")).toBe("barbearia-ze");
  });

  it("acrescenta sufixo quando está usado", () => {
    expect(slugLivre("central", new Set(["central", "central-2"]))).toBe("central-3");
    expect(slugLivre("central", new Set())).toBe("central");
  });
});
