import { describe, expect, it } from "vitest";
import { textoRecomendacao, textoVariacao } from "./relatorio-textos";

describe("textos do relatório (E.5)", () => {
  it("a variação leva o sinal e a vírgula decimal", () => {
    expect(textoVariacao(12.5)).toBe("+12,5 % face ao mês anterior");
    expect(textoVariacao(-3)).toBe("-3 % face ao mês anterior");
    expect(textoVariacao(null)).toBe("Sem mês anterior para comparar");
  });
  it("cada recomendação diz o número em euros", () => {
    expect(textoRecomendacao({ tipo: "campanha", perdidos: 42, valorCent: 63000 })).toContain(
      "42 clientes perdidos",
    );
    expect(
      textoRecomendacao({
        tipo: "preco_periodo",
        diaSemana: 2,
        ocupacao: 35,
        adicionalCent: 12000,
      }),
    ).toMatch(/^Terça ficou com 35 % de ocupação/);
  });
});
