import { describe, expect, it } from "vitest";
import { estadoFuncionalidade } from "./grelha";

describe("estado na grelha (D.4)", () => {
  it("no pacote, bónus, desativada pela Performa LAB e inativa", () => {
    expect(estadoFuncionalidade(true, true)).toBe("pacote");
    expect(estadoFuncionalidade(false, true)).toBe("bonus");
    expect(estadoFuncionalidade(true, false)).toBe("desativada");
    expect(estadoFuncionalidade(false, false)).toBe("inativa");
  });
});
