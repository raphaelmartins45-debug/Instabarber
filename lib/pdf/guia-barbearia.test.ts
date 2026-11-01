import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { gerarGuiaBarbearia } from "./guia-barbearia";

import { registarTextoEscrito } from "./texto-escrito";

let escrito: ReturnType<typeof registarTextoEscrito>;
beforeEach(() => {
  escrito = registarTextoEscrito();
});
afterEach(() => escrito.parar());

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
  assinatura: {
    nome: "Apoio ao cliente",
    cargo: null,
    telefone: "912 345 678",
    email: "apoio@instabarber.pt",
  },
};

describe("guia de arranque personalizado", () => {
  it("tem a capa e as quatro secções, com os endereços e a assinatura", () => {
    const doc = gerarGuiaBarbearia(dados);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(5);
    const texto = escrito.texto();
    expect(texto).toContain("judah.instabarber.pt/gestor");
    expect(texto).toContain("judah.instabarber.pt/barbeiro");
    expect(texto).toContain("Apoio ao cliente");
    expect(texto).toContain("912 345 678");
    expect(texto).toContain("Judah Barber");
  });
});
