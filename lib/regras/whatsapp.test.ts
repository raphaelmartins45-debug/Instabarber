import { describe, expect, it } from "vitest";
import { ligacaoWhatsApp } from "./whatsapp";

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
