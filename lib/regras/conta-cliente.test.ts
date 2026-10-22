import { describe, expect, it } from "vitest";
import { eContaCliente, emailTecnicoCliente } from "./conta-cliente";

const inquilino = "aaaaaaaa-0000-0000-0000-000000000000";

describe("emailTecnicoCliente", () => {
  it("um e-mail por telefone e por barbearia", () => {
    expect(emailTecnicoCliente("+351912345678", inquilino)).toBe(
      `351912345678.${inquilino}@clientes.instabarber.pt`,
    );
    expect(eContaCliente(emailTecnicoCliente("+351912345678", inquilino))).toBe(true);
    expect(eContaCliente("carlos@barbearia.pt")).toBe(false);
  });

  it("recusa valores que não são telefone ou id", () => {
    expect(() => emailTecnicoCliente("x", inquilino)).toThrow();
    expect(() => emailTecnicoCliente("+351912345678", "a@b")).toThrow();
  });
});
