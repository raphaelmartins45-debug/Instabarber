import { describe, expect, it } from "vitest";
import type { Custo } from "./custos";
import {
  ativaNoMes,
  type BarbeariaFin,
  pontoDeEquilibrio,
  resumoDoMes,
  semIvaDoRecebido,
  serieMensal,
  valorDoPlano,
  valorMedio,
} from "./indicadores";

const b = (x: Partial<BarbeariaFin>): BarbeariaFin => ({
  plano: "pro",
  periodicidade: "mensal",
  profissionais_contratados: 3,
  dominio_proprio: null,
  estado: "ativo",
  estado_pagamento: "em_dia",
  aprovadaEm: "2026-08-10",
  canceladaEm: null,
  ...x,
});
const custo: Custo = {
  id: "c",
  descricao: "Contabilista",
  categoria: "contabilidade",
  tipo: "fixo",
  valorSemIvaCent: 5000,
  periodicidade: "mensal",
  dataInicio: "2026-01-01",
  dataFim: null,
  ativo: true,
};

describe("indicadores", () => {
  it("recebido sem IVA: ÷ 1,23 no regime normal, igual no isento", () => {
    expect(semIvaDoRecebido(4797, "normal")).toBe(3900);
    expect(semIvaDoRecebido(4797, "isento")).toBe(4797);
  });

  it("valores dos planos e ponto de equilíbrio feitos à mão", () => {
    expect(valorDoPlano("basic", "normal")).toBe(1999);
    expect(valorDoPlano("pro", "normal")).toBe(3999);
    // 200 € de fixos ÷ (39 € − 1 €) = 5,26 → 6 barbearias.
    expect(pontoDeEquilibrio(20000, 3900, 100)).toBe(6);
    expect(pontoDeEquilibrio(20000, 100, 100)).toBeNull();
    expect(valorMedio(null, 50, "normal")).toBe(2999);
    expect(valorMedio(3000, 50, "normal")).toBe(3000);
  });

  it("resumo do mês: MRR com o anual a 10/12, lucros, margem, ARPU e atraso", () => {
    const r = resumoDoMes({
      barbearias: [
        b({}),
        b({ plano: "basic", profissionais_contratados: 1, periodicidade: "anual" }),
        b({ estado_pagamento: "em_atraso" }),
        b({ estado: "cancelado", canceladaEm: "2026-10-05" }),
      ],
      recebimentos: [
        { valorCent: 4797, data: "2026-10-02" },
        { valorCent: 4797, data: "2026-09-30" },
      ],
      custos: [custo],
      contas: [{ semIvaCent: 1000, comIvaCent: 1230, pagoEm: "2026-10-03" }],
      mes: "2026-10",
      mesAnterior: "2026-09",
      regime: "normal",
    });
    // 39,99 + 39,99 + 199,90/12 (16,66) = 96,64 €.
    expect(r.mrr).toBe(9664);
    expect(r.ativas).toBe(3);
    expect(r.recebido).toBe(3900);
    expect(r.lucroEstimado).toBe(4664);
    expect(r.lucroCaixa).toBe(2900);
    expect(r.margem).toBeCloseTo(0.4826, 3);
    expect(r.arpu).toBe(3221);
    expect(r.atraso).toEqual({ comIva: 4919, n: 1 });
    expect(r.saidas).toBeNull();
  });

  it("série: uma barbearia conta desde o mês de aprovação até ao da saída", () => {
    const cancelada = b({ estado: "cancelado", canceladaEm: "2026-10-05" });
    expect(ativaNoMes(cancelada, "2026-09")).toBe(true);
    expect(ativaNoMes(cancelada, "2026-10")).toBe(false);
    const s = serieMensal(["2026-07", "2026-08"], [b({})], [custo], "normal");
    expect(s).toEqual([
      { mes: "2026-07", receita: 0, custos: 5000, lucro: -5000 },
      { mes: "2026-08", receita: 3999, custos: 5000, lucro: -1001 },
    ]);
  });
});
