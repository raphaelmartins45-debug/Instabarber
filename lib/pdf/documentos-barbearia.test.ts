import { describe, expect, it } from "vitest";
import { gerarCartaz } from "./cartaz";
import { gerarGuiaBarbeiro } from "./guia-barbeiro";
import { gerarResumoConta } from "./resumo-conta";

describe("documentos da barbearia", () => {
  it("guia do barbeiro com o endereço /barbeiro", () => {
    const doc = gerarGuiaBarbeiro({
      barbearia: "Judah Barber",
      logo: null,
      barbeiro: "https://judah.instabarber.pt/barbeiro",
    });
    expect(doc.getNumberOfPages()).toBe(3);
    expect(doc.output()).toContain("judah.instabarber.pt/barbeiro");
  });

  it("cartaz numa página, com o endereço escrito", () => {
    const doc = gerarCartaz({
      barbearia: "Judah Barber",
      cor: "#1E3A5F",
      logo: null,
      qr: "https://judah.instabarber.pt/marcar",
      endereco: "https://judah.instabarber.pt",
    });
    expect(doc.getNumberOfPages()).toBe(1);
    expect(doc.output()).toContain("judah.instabarber.pt");
  });

  it("resumo da conta diz que não é documento fiscal", () => {
    const doc = gerarResumoConta({
      barbearia: "Judah Barber",
      plano: "pro",
      periodicidade: "mensal",
      profissionais: 3,
      dominioProprio: false,
      descontoPct: 0,
      valorCent: 3999,
      estado: "ativo",
      estadoPagamento: "em_dia",
      proximoVencimento: "2026-11-27",
      recebimentos: [{ data: "2026-10-27", metodo: "mbway", valorCent: 3999 }],
    });
    const texto = doc.output();
    expect(texto).toContain("documento fiscal");
    expect(texto).toContain("MB WAY");
  });
});
