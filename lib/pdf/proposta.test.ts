import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { esquemaBriefing } from "@/lib/comercial/briefing";
import { gerarPdfProposta } from "./proposta";

import { registarTextoEscrito } from "./texto-escrito";

let escrito: ReturnType<typeof registarTextoEscrito>;
beforeEach(() => {
  escrito = registarTextoEscrito();
});
afterEach(() => escrito.parar());

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
  implementacao: "nenhuma",
  taxaSemIva: "0",
  dados: {
    briefing,
    decomposicao: [{ rotulo: "Base Pro", valorCent: 3900 }],
    incluidas: Array.from({ length: 30 }, (_, i) => `Funcionalidade ${i + 1}`),
    solucao: [{ dor: "faltas", funcionalidades: ["Lembrete individual por WhatsApp"] }],
    valor_para_si_cent: 13200,
    mensal_com_iva_cent: 4797,
  },
  destinatario: "Miguel Sousa",
  assinatura: {
    nome: "Raphael Martins",
    cargo: "Gestor comercial",
    telefone: "912 345 678",
    email: "raphael@instabarber.pt",
  },
};

describe("PDF da proposta (N.5)", () => {
  it("capa sem rodapé; «Não é documento fiscal» em todas as outras páginas e desafio", () => {
    const doc = gerarPdfProposta({ ...base, condicoes: "# Condições\n\n1. Não há fidelização." });
    const paginas = doc.getNumberOfPages();
    const pdf = escrito.texto();
    // A capa não leva rodapé; as outras páginas levam.
    expect(pdf.split("documento fiscal").length - 1).toBe(paginas - 1);
    expect(pdf).toContain("PRP-2026-0001");
    expect(pdf).toContain("Desafio de 90 dias");
    expect(pdf).toContain("Não há fidelização");
    expect(pdf).not.toMatch(/recibo|fatura/i);
  });

  it("assina quem a gerou: nome, cargo, WhatsApp e e-mail (D-184)", () => {
    const pdf = gerarPdfProposta({ ...base, condicoes: null }) && escrito.texto();
    for (const parte of ["Raphael Martins", "Gestor comercial", "912 345 678", "raphael@"])
      expect(pdf).toContain(parte);
    expect(pdf).toContain("Preparada para Miguel Sousa");
  });

  it("isento de IVA: um só total, com a nota do artigo 53.º", () => {
    const pdf =
      gerarPdfProposta({
        ...base,
        condicoes: null,
        ivaTaxa: 0,
        valorComIva: "39.00",
      }) && escrito.texto();
    expect(pdf).not.toContain("Total com IVA");
    expect(pdf).toContain("Artigo 53");
  });

  it("sem modelo de condições aprovado, o PDF avisa em vez de inventar texto jurídico", () => {
    const pdf = gerarPdfProposta({ ...base, condicoes: null }) && escrito.texto();
    expect(pdf).toContain("Condições por aprovar");
  });
});

describe("desconto e implementação no PDF (D-161, D-189)", () => {
  it("mostra o desconto e a implementação quando existem", () => {
    const texto =
      gerarPdfProposta({
        ...base,
        condicoes: null,
        descontoPct: 20,
        implementacao: "formacao",
        taxaSemIva: "100.00",
      }) && escrito.texto();
    expect(texto).toContain("Desconto de 20");
    expect(texto).toContain("Implementação com Formação");
    expect(texto).toContain("Expositor em acrílico");
  });
});
