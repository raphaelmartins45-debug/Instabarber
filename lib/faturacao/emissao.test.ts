import { describe, expect, it } from "vitest";
import { acaoDoModo, dadosParaPortal, emitenteDoModelo } from "./emissao";
import { faturacaoSimulada } from "./simulado";

describe("faturação desligada (G.4)", () => {
  it("o emitente segue o modelo de caixa (D-03)", () => {
    expect(emitenteDoModelo("A")).toBe("barbearia");
    expect(emitenteDoModelo("B")).toBe("profissional");
    expect(emitenteDoModelo("C")).toBe("profissional");
  });
  it("cada modo de emissão tem a sua ação; «nenhum» não faz nada", () => {
    expect(acaoDoModo("certificado")).toBe("emitir");
    expect(acaoDoModo("portal")).toBe("por_emitir");
    expect(acaoDoModo("nenhum")).toBe("nada");
  });
  it("prepara os dados do Portal das Finanças", () => {
    expect(
      dadosParaPortal({
        emitente: "profissional",
        nifCliente: "123456789",
        descricao: "Corte",
        valorCent: 1500,
        isentoIva: true,
      }),
    ).toEqual(["123456789", "Corte", "15.00", "M10"]);
  });
  it("o adaptador simulado numera e anula uma só vez", async () => {
    const f = faturacaoSimulada();
    const d = {
      emitente: "barbearia" as const,
      nifCliente: null,
      descricao: "Corte",
      valorCent: 1500,
      isentoIva: false,
    };
    expect((await f.emitir(d)).numero).toBe("SIM 0001");
    expect((await f.emitir(d)).numero).toBe("SIM 0002");
    expect(await f.anular("SIM 0001")).toBe(true);
    expect(await f.anular("SIM 0001")).toBe(false);
  });
});
