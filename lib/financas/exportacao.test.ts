import { describe, expect, it } from "vitest";
import { seccoesParaCsv } from "@/lib/exportacao/csv";
import { cabecalhoDaExportacao, mesesDoPeriodo, seccoesDaExportacao } from "./exportacao";

describe("exportação das Finanças", () => {
  it("meses do mês, do trimestre e do ano da referência", () => {
    expect(mesesDoPeriodo("mes", "2026-10")).toEqual(["2026-10"]);
    expect(mesesDoPeriodo("trimestre", "2026-11")).toEqual(["2026-10", "2026-11", "2026-12"]);
    expect(mesesDoPeriodo("ano", "2026-05")).toHaveLength(12);
    expect(mesesDoPeriodo("ano", "2026-05")[0]).toBe("2026-01");
  });

  it("CSV com BOM, «;», aviso fiscal e colunas sem e com IVA", () => {
    const meses = mesesDoPeriodo("mes", "2026-10");
    const csv = seccoesParaCsv(
      cabecalhoDaExportacao(meses),
      seccoesDaExportacao({
        tipo: "mes",
        meses,
        regime: "normal",
        barbearias: [
          {
            nome: "Barbearia; Alfa",
            plano: "pro",
            periodicidade: "mensal",
            profissionais_contratados: 3,
            dominio_proprio: null,
            estado: "ativo",
            estado_pagamento: "em_dia",
            aprovadaEm: "2026-09-01",
            canceladaEm: null,
          },
        ],
        recebimentos: [{ valorCent: 4797, data: "2026-10-03", barbearia: "Barbearia; Alfa" }],
        custos: [],
        contas: [],
        metas: [{ mes: "2026-10-01", valorCent: 10000, base: "mrr" }],
      }),
    );
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("Não é documento fiscal.");
    expect(csv).toContain("Período: 2026-10");
    expect(csv).toContain('2026-10-03;"Barbearia; Alfa";39,00;47,97');
    expect(csv).toContain("Mês;Receita recorrente;Custos;Lucro estimado;Recebido;Lucro de caixa");
    expect(csv).toContain("2026-10;39,99;0,00;39,99;39,00;39,00");
    expect(csv).toContain("2026-10;100,00;receita recorrente;40 %");
  });
});
