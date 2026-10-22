import { describe, expect, it } from "vitest";
import { gerarResumoContratacao } from "./resumo-contratacao";

const dados = {
  contratante: "Barbearia Central",
  responsavel: "Miguel Sousa",
  nif: "509999999",
  plano: "Pro",
  periodicidade: "Mensal",
  profissionais: 5,
  decomposicao: [
    { rotulo: "Plano base", valorCent: 3900 },
    { rotulo: "2 profissional(is) extra", valorCent: 2000 },
  ],
  preco: { semIva: 5900, comIva: 7257, ivaTaxa: 23 as const },
  textoIva: "IVA a 23 % incluído",
  funcionalidades: Array.from({ length: 40 }, (_, i) => `Funcionalidade ${i + 1}`),
  emailAcesso: "miguel@central.pt",
  pagamento: "MB WAY",
  data: "22/10/2026",
};

describe("resumo da contratação (D.11)", () => {
  it("leva o rodapé «Não é documento fiscal» em todas as páginas e nunca palavra-passe", () => {
    const doc = gerarResumoContratacao(dados);
    const paginas = doc.getNumberOfPages();
    expect(paginas).toBeGreaterThan(1);
    const pdf = doc.output();
    expect(pdf.split("documento fiscal").length - 1).toBe(paginas);
    expect(pdf).toContain(`de ${paginas}`);
    expect(pdf.toLowerCase()).not.toContain("palavra-passe");
    expect(pdf).not.toMatch(/recibo|fatura emitida pela plataforma/i);
  });
});
