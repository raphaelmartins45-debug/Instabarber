import { describe, expect, it } from "vitest";
import { doDominio, esquemaConviteEquipa } from "./equipa-plataforma";

describe("convite para a equipa InstaBarber", () => {
  it("aceita gestor e comercial, nunca super_admin", () => {
    expect(
      esquemaConviteEquipa.safeParse({
        nome: "Ana",
        email: "ana@instabarber.pt",
        papel: "comercial",
      }).success,
    ).toBe(true);
    expect(
      esquemaConviteEquipa.safeParse({
        nome: "Ana",
        email: "ana@instabarber.pt",
        papel: "super_admin",
      }).success,
    ).toBe(false);
  });

  it("só e-mails do domínio da InstaBarber", () => {
    expect(doDominio("Ana@InstaBarber.pt", "instabarber.pt")).toBe(true);
    expect(doDominio("ana@gmail.com", "instabarber.pt")).toBe(false);
    expect(doDominio("ana@instabarber.pt.evil.com", "instabarber.pt")).toBe(false);
    expect(doDominio("ana@teste.instabarber.pt", "instabarber.pt")).toBe(true);
    expect(doDominio("ana@xinstabarber.pt", "instabarber.pt")).toBe(false);
  });
});
