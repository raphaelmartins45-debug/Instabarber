import { describe, expect, it } from "vitest";
import { esquemaBriefing } from "@/lib/comercial/briefing";
import { gerarPdfProposta } from "./proposta";

const briefing = esquemaBriefing.parse({
  nome_comercial: "Corte Fino",
  como_marcam: ["whatsapp"],
  clientes_ativos: 400,
  valor_visita_cent: 1500,
  clientes_perdidos: 22,
  dores: ["faltas"],
  objetivo: "Reduzir faltas",
});

const base = {
  numero: "PRP-2026-0001",
  versao: 1,
  criadaEm: "2026-10-24T10:00:00Z",
  validaAte: null,
  validadeDias: 15,
  plano: "Pro",
  periodicidade: "Mensal",
  profissionais: 3,
  dominioProprio: false,
  desafio: true,
  valorSemIva: "39.00",
  valorComIva: "47.97",
  ivaTaxa: 23,
  condicoesLancamento: null,
  descontoPct: 0,
  taxaSemIva: "0",
  dados: {
    briefing,
    decomposicao: [{ rotulo: "Base Pro", valorCent: 3900 }],
    incluidas: Array.from({ length: 30 }, (_, i) => `Funcionalidade ${i + 1}`),
    solucao: [{ dor: "faltas", funcionalidades: ["Lembrete individual por WhatsApp"] }],
    valor_para_si_cent: 13200,
    mensal_com_iva_cent: 4797,
  },
  contacto: { email: "comercial@instabarber.pt", telefone: "+351 900 000 000" },
};

describe("PDF da proposta (N.5)", () => {
  it("rodapé «Não é documento fiscal» em todas as páginas, preço com IVA e desafio", () => {
    const doc = gerarPdfProposta({ ...base, condicoes: "# Condições\n\n1. Não há fidelização." });
    const paginas = doc.getNumberOfPages();
    const pdf = doc.output();
    expect(pdf.split("documento fiscal").length - 1).toBe(paginas);
    expect(pdf).toContain("PRP-2026-0001");
    expect(pdf).toContain("Desafio de 90 dias");
    expect(pdf).toContain("Não há fidelização");
    expect(pdf).not.toMatch(/recibo|fatura/i);
  });

  it("sem modelo de condições aprovado, o PDF avisa em vez de inventar texto jurídico", () => {
    const pdf = gerarPdfProposta({ ...base, condicoes: null }).output();
    expect(pdf).toContain("Condições por aprovar");
  });
});

describe("desconto e taxa de migração no PDF (D-161)", () => {
  it("mostra o desconto e a taxa quando existem", () => {
    const texto = gerarPdfProposta({
      ...base,
      condicoes: null,
      descontoPct: 20,
      taxaSemIva: "100.00",
    }).output();
    expect(texto).toContain("Desconto de 20");
    expect(texto).toContain("Taxa de migra");
  });
});
