import { describe, expect, it } from "vitest";
import { escolherTelefoneApoio } from "./telefone";

describe("escolherTelefoneApoio", () => {
  it("prefere o telefone do apoio", () => {
    expect(escolherTelefoneApoio("+351 912 345 678", "+351 920 000 000")).toEqual({
      e164: "+351912345678",
      texto: "912 345 678",
    });
  });
  it("sem o do apoio, usa o comercial (também só com dígitos)", () => {
    expect(escolherTelefoneApoio("", undefined, "351920084411")).toEqual({
      e164: "+351920084411",
      texto: "920 084 411",
    });
  });
  it("ignora valores inválidos e devolve nulo se nenhum servir", () => {
    expect(escolherTelefoneApoio("abc", null, "123")).toBeNull();
  });
});
