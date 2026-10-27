import { describe, expect, it } from "vitest";
import { ligacaoParaTelefone, ligacaoSemNumero, ligacaoWhatsApp } from "./whatsapp";

describe("ligacaoWhatsApp", () => {
  it("tira o + e codifica a mensagem", () => {
    expect(ligacaoWhatsApp("+351912345678", "Código: 123 456 & já")).toBe(
      "https://wa.me/351912345678?text=C%C3%B3digo%3A%20123%20456%20%26%20j%C3%A1",
    );
  });

  it("recusa um telefone inválido", () => {
    expect(() => ligacaoWhatsApp("abc", "x")).toThrow();
  });
});

describe("ligacaoParaTelefone", () => {
  it("acrescenta o indicativo aos números portugueses", () => {
    expect(ligacaoParaTelefone("912 345 678", "Olá")).toBe(
      "https://wa.me/351912345678?text=Ol%C3%A1",
    );
    expect(ligacaoParaTelefone("+34612345678", "x")).toBe("https://wa.me/34612345678?text=x");
  });

  it("sem telefone ou inválido dá nulo", () => {
    expect(ligacaoParaTelefone(null, "x")).toBeNull();
    expect(ligacaoParaTelefone("123", "x")).toBeNull();
  });
});

describe("ligacaoSemNumero", () => {
  it("abre o WhatsApp sem contacto, com o texto codificado", () => {
    expect(ligacaoSemNumero("Olá & até já")).toBe(
      "https://wa.me/?text=Ol%C3%A1%20%26%20at%C3%A9%20j%C3%A1",
    );
  });
});
