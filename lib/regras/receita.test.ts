import { describe, expect, it } from "vitest";
import { precoDoPeriodo, receitaMensal } from "./receita";

const b = (
  plano: string,
  periodicidade: string,
  n: number,
  estado = "ativo",
  dominio: string | null = null,
) => ({
  plano,
  periodicidade,
  profissionais_contratados: n,
  dominio_proprio: dominio,
  estado,
});

describe("receita recorrente mensal", () => {
  it("soma as ativas, com o anual a dividir por 12 e o extra do domínio", () => {
    const r = receitaMensal(
      [
        b("basic", "mensal", 1),
        b("pro", "anual", 3),
        b("pro", "mensal", 4, "suspenso"),
        b("basic", "mensal", 1, "ativo", "x.pt"),
      ],
      "normal",
    );
    // 24,59 + 491,88/12 (40,99) + 30,74
    expect(r.comIva).toBe(2459 + 4099 + 3074);
    expect(r.semIva).toBe(1999 + 3333 + 2499);
  });

  it("as barbearias em cortesia não contam (D-189)", () => {
    const cortesia = { ...b("basic", "mensal", 1), cortesia: true, cortesia_ate: "2026-12-31" };
    expect(receitaMensal([cortesia], "normal", "2026-11-03").comIva).toBe(0);
    expect(receitaMensal([cortesia], "normal", "2027-01-01").comIva).toBe(2459);
  });

  it("preço do período com a campanha (D-190)", () => {
    const pro = { ...b("pro", "mensal", 4), desconto_mensalidade_pct: 0 };
    const sem = {
      semMensalidade: false,
      descontoPct: 0,
      profissionaisGratis: 0,
      dominioGratis: false,
    };
    expect(precoDoPeriodo(pro, sem, "isento").comIva).toBe(4999);
    expect(precoDoPeriodo(pro, { ...sem, profissionaisGratis: 1 }, "isento").comIva).toBe(3999);
    expect(precoDoPeriodo(pro, { ...sem, descontoPct: 50 }, "isento").comIva).toBe(2500);
    expect(precoDoPeriodo(pro, { ...sem, semMensalidade: true }, "isento").comIva).toBe(0);
    const semestral = b("basic", "semestral", 1);
    expect(precoDoPeriodo(semestral, sem, "isento").comIva).toBe(1999 * 6);
  });
});
