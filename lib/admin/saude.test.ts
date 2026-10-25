import { describe, expect, it } from "vitest";
import { arranque, type DadosSaude, saude } from "./saude";

const base: DadosSaude = {
  estado: "ativo",
  estadoPagamento: "em_dia",
  aprovadaEm: "2026-08-01",
  temLogotipo: true,
  servicosAtivos: 5,
  profissionaisAtivos: 3,
  profissionaisComAcesso: 3,
  clientes: 120,
  marcacoesTotal: 300,
  marcacoesOnline: 40,
  concluidas: 250,
  marcacoes30: 90,
  marcacoesAnteriores30: 100,
  ultimaMarcacao: "2026-10-24",
};
const HOJE = "2026-10-25";

describe("arranque", () => {
  it("conta os passos cumpridos", () => {
    expect(arranque(base).percentagem).toBe(100);
    const nova = arranque({
      ...base,
      profissionaisComAcesso: 0,
      marcacoesOnline: 0,
      concluidas: 0,
    });
    expect(nova.percentagem).toBe(63);
    expect(nova.feito.acessos).toBe(false);
  });
});

describe("saude", () => {
  it("bom quando tudo corre bem", () => {
    expect(saude(base, HOJE)).toEqual({ nivel: "bom", motivos: [] });
  });

  it("risco com atraso, suspensão ou 14 dias sem marcações", () => {
    expect(saude({ ...base, estadoPagamento: "em_atraso" }, HOJE).nivel).toBe("risco");
    expect(saude({ ...base, estado: "suspenso" }, HOJE).motivos).toContain("suspensa");
    expect(saude({ ...base, ultimaMarcacao: "2026-10-01" }, HOJE).motivos).toEqual([
      "semMarcacoes",
    ]);
  });

  it("não acusa falta de marcações nas primeiras duas semanas", () => {
    const nova = { ...base, aprovadaEm: "2026-10-20", marcacoesTotal: 0, ultimaMarcacao: null };
    expect(saude(nova, HOJE).motivos).not.toContain("semMarcacoes");
    expect(saude({ ...nova, aprovadaEm: "2026-10-01" }, HOJE).motivos).toContain("semMarcacoes");
  });

  it("atenção com queda para metade (base de 10) ou arranque lento depois de 30 dias", () => {
    expect(saude({ ...base, marcacoes30: 50, marcacoesAnteriores30: 100 }, HOJE)).toEqual({
      nivel: "atencao",
      motivos: ["quedaMarcacoes"],
    });
    expect(saude({ ...base, marcacoes30: 2, marcacoesAnteriores30: 5 }, HOJE).motivos).toEqual([]);
    const lenta = {
      ...base,
      temLogotipo: false,
      profissionaisComAcesso: 0,
      clientes: 0,
      marcacoesOnline: 0,
      concluidas: 0,
    };
    expect(saude(lenta, HOJE).motivos).toContain("arranqueLento");
  });
});
