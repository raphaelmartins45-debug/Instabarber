import { describe, expect, it } from "vitest";
import { linhaAcerto, montarAcerto, type VisitaAcerto } from "./acertos";

const v = (cobrado: number, comissao: number, clube = false): VisitaAcerto => ({
  valorCobradoCent: cobrado,
  comissaoCent: comissao,
  clube,
});

describe("montarAcerto", () => {
  it("modelo A: a barbearia paga todas as comissões", () => {
    const a = montarAcerto("A", [v(2000, 700), v(0, 700, true)]);
    expect(a).toMatchObject({ servicos: 2, receitaCent: 2000, aPagarCent: 1400, aReceberCent: 0 });
    expect(a.sentido).toBe("a_pagar");
  });
  it("modelo B: o barbeiro entrega a parte da casa; o clube é-lhe devido", () => {
    const a = montarAcerto("B", [v(2000, 700), v(1500, 525), v(0, 700, true)]);
    expect(a).toMatchObject({ aPagarCent: 700, aReceberCent: 2275, saldoCent: -1575 });
    expect(a.sentido).toBe("a_receber");
  });
  it("modelo C: paga a renda e recebe as comissões do clube", () => {
    const a = montarAcerto("C", [v(2000, 0), v(0, 900, true)], 50000);
    expect(a).toMatchObject({ aPagarCent: 900, aReceberCent: 50000, saldoCent: -49100 });
  });
  it("sem nada a acertar: a_receber com saldo zero", () => {
    expect(montarAcerto("A", [])).toMatchObject({ saldoCent: 0, sentido: "a_receber" });
  });
});

describe("linhaAcerto (exemplos da F.4.11)", () => {
  it("Rafael, modelo A, liquidado", () => {
    const a = montarAcerto("A", [v(214000, 74900)]);
    expect(linhaAcerto(a, [{ sentido: "a_pagar", valorCent: 74900 }])).toMatchObject({
      acertoCent: 74900,
      liquidadoCent: 74900,
      porLiquidarCent: 0,
      estado: "liquidado",
    });
  });
  it("Diogo, modelo B, 400,00 € entregues de 615,30 €", () => {
    const a = montarAcerto("B", [v(175800, 114270)]);
    expect(linhaAcerto(a, [{ sentido: "a_receber", valorCent: 40000 }])).toMatchObject({
      acertoCent: 61530,
      liquidadoCent: 40000,
      porLiquidarCent: 21530,
      estado: "a_receber",
    });
  });
  it("uma correção de sinal contrário anula parte do liquidado", () => {
    const a = montarAcerto("A", [v(10000, 5000)]);
    const l = linhaAcerto(a, [
      { sentido: "a_pagar", valorCent: 6000 },
      { sentido: "a_receber", valorCent: 1000 },
    ]);
    expect(l).toMatchObject({ liquidadoCent: 5000, estado: "liquidado" });
  });
});
