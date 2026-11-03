import { describe, expect, it } from "vitest";
import { ajusteDoPeriodo, type Campanha, campanhasDisponiveis } from "./campanhas";

const base: Campanha = {
  id: "1",
  chave: "sobe_pro",
  nome: "Sobe para Pro",
  texto: "x",
  ativa: true,
  valida_ate: null,
  vagas: null,
  usadas: 0,
  planos: ["pro"],
  periodicidade: "mensal",
  implementacao: null,
  implementacaoCent: null,
  meses_oferta: 0,
  primeiro_mes_gratis: false,
  meses_condicao: 3,
  desconto_temporario_pct: 50,
  profissionais_gratis: 0,
  dominio_gratis: false,
};

describe("campanhas (D-190)", () => {
  it("só as ligadas, dentro da data, com vagas e para o plano", () => {
    const lista = [
      base,
      { ...base, id: "2", ativa: false },
      { ...base, id: "3", valida_ate: "2026-11-02" },
      { ...base, id: "4", vagas: 1, usadas: 1 },
      { ...base, id: "5", planos: ["basic"] },
    ];
    expect(campanhasDisponiveis(lista, "pro", "2026-11-03").map((c) => c.id)).toEqual(["1"]);
  });

  it("a condição temporária vale no primeiro período e até campanha_ate", () => {
    const novo = { primeiro_pagamento_em: null, campanha_ate: null };
    expect(ajusteDoPeriodo(base, novo, "2026-11-01").descontoPct).toBe(50);
    const pago = { primeiro_pagamento_em: "2026-11-01", campanha_ate: "2027-01-31" };
    expect(ajusteDoPeriodo(base, pago, "2027-01-01").descontoPct).toBe(50);
    expect(ajusteDoPeriodo(base, pago, "2027-02-01").descontoPct).toBe(0);
    expect(ajusteDoPeriodo(null, novo, "2026-11-01").descontoPct).toBe(0);
  });

  it("o primeiro mês de oferta só no primeiro período", () => {
    const c = { ...base, primeiro_mes_gratis: true, meses_condicao: 0, desconto_temporario_pct: 0 };
    expect(
      ajusteDoPeriodo(c, { primeiro_pagamento_em: null, campanha_ate: null }, "x").semMensalidade,
    ).toBe(true);
    expect(
      ajusteDoPeriodo(c, { primeiro_pagamento_em: "2026-11-01", campanha_ate: null }, "x")
        .semMensalidade,
    ).toBe(false);
  });
});
