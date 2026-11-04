import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { conviteDemonstracao } = await import("./convite-demonstracao");

describe("convite da demonstração (D-209)", () => {
  const email = conviteDemonstracao({
    para: "ze@barbearia.pt",
    nome: "Zé",
    barbearia: "Barbearia do Zé",
    ligacao: "https://instabarber.pt/demo",
    codigo: "123456",
  });

  it("segue do comercial para o lead, com o nome da barbearia no assunto", () => {
    expect(email.de).toContain("comercial@instabarber.pt");
    expect(email.para).toBe("ze@barbearia.pt");
    expect(email.assunto).toContain("Barbearia do Zé");
  });

  it("leva a ligação e o código, no texto e no HTML", () => {
    for (const corpo of [email.texto, email.html ?? ""]) {
      expect(corpo).toContain("https://instabarber.pt/demo");
      expect(corpo).toContain("123456");
    }
  });
});
