import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { gerarPlaca } from "./placa";
import { gerarGuiaBarbeiro } from "./guia-barbeiro";
import { gerarResumoConta } from "./resumo-conta";

import { registarTextoEscrito } from "./texto-escrito";

let escrito: ReturnType<typeof registarTextoEscrito>;
beforeEach(() => {
  escrito = registarTextoEscrito();
});
afterEach(() => escrito.parar());

const apoio = {
  nome: "Apoio ao cliente",
  cargo: null,
  telefone: "912 345 678",
  email: "apoio@instabarber.pt",
};

describe("documentos da barbearia", () => {
  it("guia do barbeiro com o endereço /barbeiro", () => {
    const doc = gerarGuiaBarbeiro({
      barbearia: "Judah Barber",
      logo: null,
      barbeiro: "https://judah.instabarber.pt/barbeiro",
      assinatura: apoio,
    });
    expect(doc.getNumberOfPages()).toBe(3);
    expect(escrito.texto()).toContain("judah.instabarber.pt/barbeiro");
    expect(escrito.texto()).toContain("Apoio ao cliente");
  });

  it("placa do balcão nos três modelos, numa página, com o endereço e os textos (D-185)", () => {
    for (const modelo of ["selos", "escuro", "cor"] as const) {
      const doc = gerarPlaca({
        modelo,
        titulo: "Marque online e acumule selos",
        frase: "Ganhe um selo a cada serviço.",
        vantagem: "Ao 10.º selo, Corte oferecido",
        barbearia: "Judah Barber",
        cor: "#1E3A5F",
        logo: null,
        qr: "https://judah.instabarber.pt/marcar",
        endereco: "https://judah.instabarber.pt",
        selos: 10,
      });
      expect(doc.getNumberOfPages()).toBe(1);
      const texto = escrito.texto();
      expect(texto).toContain("judah.instabarber.pt");
    }
  });

  it("resumo da conta diz que não é documento fiscal", () => {
    gerarResumoConta({
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
      assinatura: apoio,
    });
    const texto = escrito.texto();
    expect(texto).toContain("documento fiscal");
    expect(texto).toContain("MB WAY");
  });
});
