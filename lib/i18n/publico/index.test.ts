import { describe, expect, it } from "vitest";
import { linguaDoDispositivo, textosPublicos } from "./index";

describe("línguas da página pública (I.3.2)", () => {
  it("só os dois primeiros caracteres: pt-BR em português, fr-CA em francês, o resto em inglês", () => {
    expect(linguaDoDispositivo("pt-BR,pt;q=0.9")).toBe("pt");
    expect(linguaDoDispositivo("fr-CA")).toBe("fr");
    expect(linguaDoDispositivo("de-DE,en;q=0.8")).toBe("en");
    expect(linguaDoDispositivo(null)).toBe("pt");
  });
  it("as três línguas têm os mesmos textos", () => {
    const chaves = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === "object" && !Array.isArray(v) ? chaves(v).map((c) => `${k}.${c}`) : [k],
      );
    expect(chaves(textosPublicos("en"))).toEqual(chaves(textosPublicos("pt")));
    expect(chaves(textosPublicos("fr"))).toEqual(chaves(textosPublicos("pt")));
  });
});
