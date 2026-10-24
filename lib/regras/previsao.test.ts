import { describe, expect, it } from "vitest";
import {
  eSeTiver,
  mediaNovas,
  mesDaMeta,
  mesDoEquilibrio,
  metaEmVigor,
  pressupostosDoCenario,
  projetar,
  quantasFaltam,
  saidasPorOmissao,
  taxaConversao,
} from "./previsao";

const meses = ["2026-11", "2026-12", "2027-01"];

describe("previsões", () => {
  it("projeta o MRR mês a mês com novas e saídas", () => {
    const p = projetar(
      10000,
      { novas: 1, saidas: 0.1, valorMedio: 3900 },
      meses,
      [12000, 12000, 12000],
    );
    // 10000 + 3900 − 1000 = 12900; 12900 + 3900 − 1290 = 15510; 15510 + 3900 − 1551 = 17859.
    expect(p.map((m) => m.mrr)).toEqual([12900, 15510, 17859]);
    expect(p[0]!.lucro).toBe(900);
    expect(mesDoEquilibrio(p)).toBe("2026-11");
    expect(mesDaMeta(p, 15000)).toBe("2026-12");
    expect(mesDaMeta(p, 99999)).toBeNull();
  });

  it("cenários: pessimista e otimista mudam novas e saídas", () => {
    const base = { novas: 2, saidas: 0.04, valorMedio: 3000 };
    expect(pressupostosDoCenario(base, "pessimista")).toEqual({
      novas: 1,
      saidas: 0.06,
      valorMedio: 3000,
    });
    expect(pressupostosDoCenario(base, "otimista")).toEqual({
      novas: 3,
      saidas: 0.02,
      valorMedio: 3000,
    });
    expect(pressupostosDoCenario(base, "base")).toBe(base);
  });

  it("quantas faltam arredonda para cima e zero com a meta cumprida", () => {
    expect(quantasFaltam(10000, 3900)).toBe(3);
    expect(quantasFaltam(-1, 3900)).toBe(0);
    expect(quantasFaltam(100, 0)).toBeNull();
  });

  it("pressupostos por omissão e taxa de conversão", () => {
    expect(
      mediaNovas(
        ["2026-08-02", "2026-09-10", "2026-09-20", "2026-10-01"],
        ["2026-07", "2026-08", "2026-09"],
      ),
    ).toBe(1);
    expect(saidasPorOmissao(null)).toEqual({ valor: 0.03, declarada: true });
    expect(saidasPorOmissao(0.05)).toEqual({ valor: 0.05, declarada: false });
    expect(taxaConversao(3, 6)).toBeNull();
    expect(taxaConversao(4, 6)).toBe(0.4);
  });

  it("e se tiver 10 barbearias Pro", () => {
    expect(eSeTiver(10, 3900, 20000)).toEqual({ mrr: 39000, lucro: 19000, margem: 19000 / 39000 });
  });

  it("meta em vigor: a do mês ou a última antes dele", () => {
    const metas = [{ mes: "2026-09-01" }, { mes: "2026-12-01" }];
    expect(metaEmVigor(metas, "2026-10")).toEqual({ mes: "2026-09-01" });
    expect(metaEmVigor(metas, "2026-12")).toEqual({ mes: "2026-12-01" });
    expect(metaEmVigor(metas, "2026-08")).toBeNull();
  });
});
