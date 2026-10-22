import { describe, expect, it } from "vitest";
import { nomeFicheiroRelatorio } from "./relatorio";

describe("nomeFicheiroRelatorio (E.5)", () => {
  it("em ASCII, com o mês por extenso, o ano e o nome", () => {
    expect(nomeFicheiroRelatorio("2026-03", "Barbearia São João")).toBe(
      "Relatorio-Marco-2026-Barbearia-Sao-Joao.pdf",
    );
  });
});
