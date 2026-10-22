import { describe, expect, it } from "vitest";
import { receitaAdicionalEstimada, recomendacoes } from "./recomendacoes";
import { progressoObjetivo } from "./objetivos";

const base = {
  perdidos: 0,
  aRecuperarCent: 0,
  diasSemana: [],
  ticketCent: 1500,
  ticketAnteriorCent: 1500,
  combinacao: null,
  cartoesCompletos: 0,
  objetivo: null,
};

describe("recomendacoes (F.5)", () => {
  it("sem nenhuma condição, nada", () => {
    expect(recomendacoes(base)).toEqual([]);
  });
  it("mais de vinte perdidos: a campanha com o valor a recuperar", () => {
    expect(recomendacoes({ ...base, perdidos: 21, aRecuperarCent: 63000 })).toEqual([
      { tipo: "campanha", perdidos: 21, valorCent: 63000 },
    ]);
    expect(recomendacoes({ ...base, perdidos: 20 })).toEqual([]);
  });
  it("o dia mais fraco abaixo de 50 %", () => {
    const r = recomendacoes({
      ...base,
      diasSemana: [
        { diaSemana: 2, ocupacao: 40, adicionalCent: 3000 },
        { diaSemana: 3, ocupacao: 30, adicionalCent: 5000 },
        { diaSemana: 5, ocupacao: 80, adicionalCent: 0 },
      ],
    });
    expect(r).toEqual([{ tipo: "preco_periodo", diaSemana: 3, ocupacao: 30, adicionalCent: 5000 }]);
  });
  it("ticket abaixo do mês anterior: a combinação mais procurada", () => {
    expect(
      recomendacoes({ ...base, ticketCent: 1400, combinacao: ["barba", "corte"] })[0],
    ).toMatchObject({ tipo: "combinacao", servicos: ["barba", "corte"] });
  });
  it("objetivo acima de 80 % e por fechar: o valor por dia restante", () => {
    const objetivo = progressoObjetivo(
      100000,
      85000,
      ["2026-10-29", "2026-10-30", "2026-10-31"],
      "2026-10-30",
    );
    expect(recomendacoes({ ...base, objetivo })).toEqual([
      { tipo: "objetivo", porDiaCent: 7500, diasRestantes: 2, percentagem: 85 },
    ]);
  });
  it("no máximo quatro, pela ordem da F.5", () => {
    const objetivo = progressoObjetivo(100000, 85000, ["2026-10-31"], "2026-10-31");
    const r = recomendacoes({
      perdidos: 30,
      aRecuperarCent: 1,
      diasSemana: [{ diaSemana: 1, ocupacao: 10, adicionalCent: 1 }],
      ticketCent: 1,
      ticketAnteriorCent: 2,
      combinacao: ["a", "b"],
      cartoesCompletos: 3,
      objetivo,
    });
    expect(r.map((x) => x.tipo)).toEqual(["campanha", "preco_periodo", "combinacao", "premios"]);
  });
});

describe("receitaAdicionalEstimada", () => {
  it("os minutos até 50 % à receita por minuto", () => {
    expect(receitaAdicionalEstimada(1000, 300, 50)).toBe(10000);
    expect(receitaAdicionalEstimada(1000, 600, 50)).toBe(0);
  });
});
