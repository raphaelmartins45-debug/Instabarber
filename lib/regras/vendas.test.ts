import { describe, expect, it } from "vitest";
import { contaPerdas, profissionaisDoPlano, simularPreco, valorRecuperavelCent } from "./vendas";

describe("simulador de preço", () => {
  it("Basic isento: 19,99 € por mês, 199,90 € por ano, poupa dois meses", () => {
    const s = simularPreco("basic", 4, false, "isento");
    expect(s).toMatchObject({ profissionais: 1, mensalCent: 1999, anualCent: 19990 });
    expect(s.poupancaAnualCent).toBe(3998);
  });

  it("Pro com 5 barbeiros e domínio próprio: 39,99 + 2 × 10 + 5", () => {
    expect(simularPreco("pro", 5, true, "isento").mensalCent).toBe(6499);
  });

  it("Pro abaixo dos incluídos sobe para 3; regime normal acresce 23 %", () => {
    const s = simularPreco("pro", 1, false, "normal");
    expect(s.profissionais).toBe(3);
    expect(s.mensalCent).toBe(4919);
  });

  it("profissionais do plano", () => {
    expect(profissionaisDoPlano("basic", 3)).toBe(1);
    expect(profissionaisDoPlano("pro", Number.NaN)).toBe(3);
    expect(profissionaisDoPlano("pro", 6.7)).toBe(6);
  });
});

describe("quanto está a perder", () => {
  it("faltas por mês, recuperável e cortes para pagar", () => {
    const c = contaPerdas({
      faltasSemana: 3,
      valorVisitaCent: 1500,
      clientesPerdidos: 20,
      mensalidadeCent: 3999,
    });
    expect(c.faltasMesCent).toBe(19500);
    expect(c.recuperavelCent).toBe(12000);
    expect(c.cortesParaPagar).toBe(3);
  });

  it("sem valor da visita não divide por zero; negativos contam zero", () => {
    expect(
      contaPerdas({
        faltasSemana: -2,
        valorVisitaCent: 0,
        clientesPerdidos: 5,
        mensalidadeCent: 1999,
      }),
    ).toEqual({ faltasMesCent: 0, recuperavelCent: 0, cortesParaPagar: 0 });
  });

  it("a fórmula do briefing é a mesma", () => {
    expect(valorRecuperavelCent(10, 1200)).toBe(4800);
  });
});
