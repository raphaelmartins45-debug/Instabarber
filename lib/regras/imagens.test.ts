import { describe, expect, it } from "vitest";
import { FORMATO_CAMINHO } from "@/lib/validacao/adesao";
import { caminhoImagemAdesao, verificarImagem } from "./imagens";

describe("imagens da adesão (D.8.1)", () => {
  it("logótipo: PNG, SVG ou WEBP, até 1 MB, mínimo 512 × 512", () => {
    expect(
      verificarImagem("logo", {
        formato: "image/png",
        tamanho: 500_000,
        largura: 512,
        altura: 512,
      }),
    ).toBeNull();
    expect(verificarImagem("logo", { formato: "image/jpeg", tamanho: 100 })).toBe("formato");
    expect(verificarImagem("logo", { formato: "image/png", tamanho: 2_000_000 })).toBe("tamanho");
    expect(
      verificarImagem("logo", { formato: "image/png", tamanho: 100, largura: 300, altura: 300 }),
    ).toBe("dimensoes");
    expect(verificarImagem("logo", { formato: "image/svg+xml", tamanho: 100 })).toBeNull();
  });

  it("fachada 1600 × 900 e galeria 1200 × 800, JPG ou WEBP até 3 MB", () => {
    expect(
      verificarImagem("capa", {
        formato: "image/jpeg",
        tamanho: 2_000_000,
        largura: 1600,
        altura: 900,
      }),
    ).toBeNull();
    expect(
      verificarImagem("capa", { formato: "image/jpeg", tamanho: 100, largura: 1200, altura: 800 }),
    ).toBe("dimensoes");
    expect(
      verificarImagem("galeria", {
        formato: "image/webp",
        tamanho: 100,
        largura: 1200,
        altura: 800,
      }),
    ).toBeNull();
    expect(verificarImagem("galeria", { formato: "image/png", tamanho: 100 })).toBe("formato");
  });

  it("o caminho criado é o que a validação do pedido aceita", () => {
    const pasta = "0b9d7c1e-1111-4222-8333-444455556666";
    const caminhos = [
      caminhoImagemAdesao(pasta, "logo", 1, "image/svg+xml"),
      caminhoImagemAdesao(pasta, "capa", 1, "image/jpeg"),
      caminhoImagemAdesao(pasta, "galeria", 3, "image/webp"),
    ];
    expect(caminhos).toEqual([
      `adesoes/${pasta}/logo.svg`,
      `adesoes/${pasta}/capa.jpg`,
      `adesoes/${pasta}/galeria-3.webp`,
    ]);
    expect(caminhos.every((c) => FORMATO_CAMINHO.test(c))).toBe(true);
    expect(FORMATO_CAMINHO.test("../outra/logo.png")).toBe(false);
  });
});
