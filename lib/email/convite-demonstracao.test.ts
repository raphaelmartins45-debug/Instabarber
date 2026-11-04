import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { confirmacaoDemonstracao, conviteDemonstracao } = await import("./convite-demonstracao");

describe("e-mails da demonstração (D-209, D-211)", () => {
  it("a confirmação leva o dia e a hora e avisa do e-mail com o acesso", () => {
    const e = confirmacaoDemonstracao({
      para: "ze@barbearia.pt",
      nome: "Zé",
      quando: "quinta-feira, 6 de novembro, às 15:30",
    });
    expect(e.de).toContain("comercial@instabarber.pt");
    expect(e.texto).toContain("quinta-feira, 6 de novembro, às 15:30");
    expect(e.texto).toContain("código de acesso");
  });

  const email = conviteDemonstracao({
    para: "ze@barbearia.pt",
    nome: "Zé",
    barbearia: "Barbearia do Zé",
    quando: "hoje às 15:30",
    ligacao: "https://instabarber.pt/demo",
    codigo: "123456",
  });

  it("o lembrete diz a hora no assunto e segue do comercial para o lead", () => {
    expect(email.de).toContain("comercial@instabarber.pt");
    expect(email.para).toBe("ze@barbearia.pt");
    expect(email.assunto).toContain("hoje às 15:30");
  });

  it("leva a ligação, o código e como entrar, no texto e no HTML", () => {
    for (const corpo of [email.texto, email.html ?? ""]) {
      expect(corpo).toContain("https://instabarber.pt/demo");
      expect(corpo).toContain("123456");
      expect(corpo).toContain("Como entrar");
    }
  });
});
