import { describe, expect, it } from "vitest";
import { REGRAS_IMAGEM } from "@/lib/regras/imagens";
import { descreverFicheiro } from "./ficheiros";

describe("descreverFicheiro", () => {
  it("formatos, tamanho e medidas mínimas da regra", () => {
    expect(descreverFicheiro(REGRAS_IMAGEM.capa)).toBe(
      "Formatos: JPG, WEBP. Até 3 MB. Mínimo 1600 × 900 px.",
    );
    expect(descreverFicheiro(REGRAS_IMAGEM.logo)).toBe(
      "Formatos: PNG, SVG, WEBP. Até 1 MB. Mínimo 512 × 512 px.",
    );
  });

  it("sem tamanho nem medidas, só o formato", () => {
    expect(descreverFicheiro({ formatos: ["application/pdf"] })).toBe("Formato: PDF.");
  });
});
