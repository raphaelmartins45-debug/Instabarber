import { describe, expect, it } from "vitest";
import { blocosDoTexto, gerarPdfContrato } from "./contrato";

describe("PDF do contrato", () => {
  it("lê títulos, parágrafos e listas do Markdown sem ênfase nem comentários", () => {
    const b = blocosDoTexto("# Contrato\n<!-- nota -->\n## 1. Partes\n**A** e *B*\n- item\n---");
    expect(b).toEqual([
      { tipo: "subtitulo", texto: "Contrato" },
      { tipo: "titulo", texto: "1. Partes" },
      { tipo: "paragrafo", texto: "A e B" },
      { tipo: "paragrafo", texto: "• item" },
    ]);
  });

  it("as tabelas do Markdown viram tabelas; os traços de assinatura ficam (D-184)", () => {
    const b = blocosDoTexto(
      "| Pela Performa LAB | Pelo Cliente |\n| --- | --- |\n| Ana | Rui, gerente |\n| ____ | ____ |",
    );
    expect(b).toEqual([
      {
        tipo: "tabela",
        linhas: [
          ["Pela Performa LAB", "Pelo Cliente"],
          ["Ana", "Rui, gerente"],
          ["____", "____"],
        ],
      },
    ]);
    const pdf = gerarPdfContrato({
      texto: "# Contrato\n## Assinaturas\n| A | B |\n| --- | --- |\n| Ana | Rui |\n| ____ | ____ |",
      proposta: {
        numero: "IB-P-2026-0001",
        plano: "Pro",
        periodicidade: "Mensal",
        profissionais: 3,
        valorSemIva: "39.00",
        valorComIva: "39.00",
        decomposicao: [],
        incluidas: [],
      },
    }).output();
    expect(pdf).not.toContain("| ---");
    expect(pdf).not.toContain("____");
    expect(pdf).toContain("Rui");
  });

  it("gera o PDF com o texto e o Anexo I", () => {
    const pdf = gerarPdfContrato({
      texto: "# Contrato\n## 1. Objeto\nTexto.",
      proposta: {
        numero: "IB-P-2026-0001",
        plano: "Pro",
        periodicidade: "Mensal",
        profissionais: 3,
        valorSemIva: "39.00",
        valorComIva: "47.97",
        decomposicao: [{ rotulo: "Plano Pro", valorCent: 3900 }],
        incluidas: ["Agenda"],
      },
    });
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(pdf.output("arraybuffer").byteLength).toBeGreaterThan(1000);
  });
});
