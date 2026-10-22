import { describe, expect, it } from "vitest";
import {
  esquemaCriarAcesso,
  esquemaDefinirPalavraPasse,
  esquemaEntradaCliente,
  esquemaEntradaEquipa,
} from "./acesso";
import { esquemaRegistarBarbeiro } from "./barbeiro";

describe("esquemas de acesso", () => {
  it("o e-mail da equipa fica em minúsculas", () => {
    const r = esquemaEntradaEquipa.parse({ email: " Carlos@Barbearia.PT ", palavra_passe: "x" });
    expect(r.email).toBe("carlos@barbearia.pt");
  });

  it("palavra-passe com pelo menos 8 caracteres e repetida igual", () => {
    expect(
      esquemaDefinirPalavraPasse.safeParse({ palavra_passe: "curta", repetir: "curta" }).success,
    ).toBe(false);
    const diferentes = esquemaDefinirPalavraPasse.safeParse({
      palavra_passe: "12345678",
      repetir: "12345679",
    });
    expect(diferentes.error?.issues[0]?.message).toBe("diferentes");
    expect(
      esquemaDefinirPalavraPasse.safeParse({ palavra_passe: "12345678", repetir: "12345678" })
        .success,
    ).toBe(true);
  });

  it("o telemóvel do cliente passa a E.164", () => {
    expect(
      esquemaEntradaCliente.parse({ telefone: "912 345 678", palavra_passe: "x" }).telefone,
    ).toBe("+351912345678");
    expect(esquemaEntradaCliente.safeParse({ telefone: "12345", palavra_passe: "x" }).success).toBe(
      false,
    );
  });

  it("o código tem 6 dígitos", () => {
    const base = { telefone: "912345678", palavra_passe: "12345678" };
    expect(esquemaCriarAcesso.safeParse({ ...base, codigo: "12345" }).success).toBe(false);
    expect(esquemaCriarAcesso.safeParse({ ...base, codigo: "123456" }).success).toBe(true);
  });
});

describe("registo do barbeiro", () => {
  it("o NIF é opcional e, se vier, tem 9 dígitos", () => {
    expect(
      esquemaRegistarBarbeiro.parse({ nome: "Carlos", email: "c@b.pt", nif: "" }).nif,
    ).toBeNull();
    expect(
      esquemaRegistarBarbeiro.safeParse({ nome: "Carlos", email: "c@b.pt", nif: "123" }).success,
    ).toBe(false);
    expect(
      esquemaRegistarBarbeiro.parse({ nome: "Carlos", email: "c@b.pt", nif: "123456789" }).nif,
    ).toBe("123456789");
  });
});
