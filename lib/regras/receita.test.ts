import { describe, expect, it } from "vitest";
import { receitaMensal } from "./receita";

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
    // 24,59 + 479,70/12 (39,98 arredondado a 3998) + 30,74
    expect(r.comIva).toBe(2459 + 3998 + 3074);
    expect(r.semIva).toBe(1999 + 3250 + 2499);
  });
});
