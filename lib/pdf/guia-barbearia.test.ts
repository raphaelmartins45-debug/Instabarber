import { describe, expect, it } from "vitest";
import { gerarGuiaBarbearia } from "./guia-barbearia";

const dados = {
  barbearia: "Judah Barber",
  responsavel: "Judah",
  logo: null,
  enderecos: {
    pagina: "https://judah.instabarber.pt",
    gestor: "https://judah.instabarber.pt/gestor",
    barbeiro: "https://judah.instabarber.pt/barbeiro",
    cliente: "https://judah.instabarber.pt/cliente",
    marcar: "https://judah.instabarber.pt/marcar",
  },
  assinatura: { nome: "Raphael Martins", funcao: "InstaBarber" },
};

describe("guia de arranque personalizado", () => {
  it("tem a capa e as quatro secções, com os endereços e a assinatura", () => {
    const doc = gerarGuiaBarbearia(dados);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(5);
    const texto = doc.output();
    expect(texto).toContain("judah.instabarber.pt/gestor");
    expect(texto).toContain("judah.instabarber.pt/barbeiro");
    expect(texto).toContain("Raphael Martins");
    expect(texto).toContain("Judah Barber");
  });
});
