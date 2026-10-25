import { describe, expect, it } from "vitest";
import { estadoComissao, resumoComissoes } from "./comissoes";

const hoje = "2026-11-12";
const lista = [
  { id: "1", estado: "pendente", valor: "100.00", vence_em: null },
  { id: "2", estado: "a_pagar", valor: 50, vence_em: "2026-11-15" },
  { id: "3", estado: "a_pagar", valor: 80, vence_em: "2026-11-11" },
  { id: "4", estado: "paga", valor: 30, vence_em: "2026-11-01" },
];

describe("comissões", () => {
  it("a pagar passa a vencida depois do prazo de 10 dias", () => {
    expect(lista.map((c) => estadoComissao(c, hoje))).toEqual([
      "pendente",
      "a_pagar",
      "vencida",
      "paga",
    ]);
  });

  it("totais por estado em cêntimos", () => {
    expect(resumoComissoes(lista, hoje)).toEqual({
      pendente: 10000,
      a_pagar: 5000,
      vencida: 8000,
      paga: 3000,
      vencidas: 1,
    });
  });
});
