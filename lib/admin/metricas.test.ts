import { describe, expect, it } from "vitest";
import type { BarbeariaFin } from "@/lib/financas/indicadores";
import {
  conversaoLeads,
  origens,
  saidasMedias,
  serieCrescimento,
  tempoComoCliente,
} from "./metricas";

const b = (x: Partial<BarbeariaFin> & { id?: string }): BarbeariaFin & { id: string } => ({
  id: "b1",
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

describe("métricas de crescimento", () => {
  const barbearias = [
    b({ id: "a" }),
    b({ id: "b", aprovadaEm: "2026-09-05" }),
    b({ id: "c", aprovadaEm: "2026-08-20", estado: "cancelado", canceladaEm: "2026-10-03" }),
  ];

  it("novas, saídas e ativas no fim de cada mês", () => {
    expect(serieCrescimento(barbearias, ["2026-08", "2026-09", "2026-10"])).toEqual([
      { mes: "2026-08", novas: 2, saidas: 0, ativasFim: 2 },
      { mes: "2026-09", novas: 1, saidas: 0, ativasFim: 3 },
      { mes: "2026-10", novas: 0, saidas: 1, ativasFim: 2 },
    ]);
  });

  it("saídas médias só com mais de 10 barbearias", () => {
    const s = serieCrescimento(barbearias, ["2026-09", "2026-10"]);
    expect(saidasMedias(s, 2)).toBeNull();
    expect(saidasMedias([{ mes: "m", novas: 0, saidas: 1, ativasFim: 19 }], 20)).toBe(0.05);
  });

  it("tempo como cliente em meses completos", () => {
    expect(tempoComoCliente(barbearias, "2026-12-15")).toEqual({ todas: 2.7, queSairam: 1 });
    expect(tempoComoCliente([], "2026-12-15")).toEqual({ todas: null, queSairam: null });
  });

  it("origem pelo lead ligado ou adesão direta", () => {
    const o = origens(barbearias, [
      { estado: "ganho", origem: "whatsapp", inquilinoId: "a" },
      { estado: "ganho", origem: "whatsapp", inquilinoId: "c" },
    ]);
    expect(o).toEqual([
      { origem: "whatsapp", n: 2 },
      { origem: "direta", n: 1 },
    ]);
  });

  it("conversão só com 10 ou mais leads decididos", () => {
    const leads = (g: number, p: number, a = 0) => [
      ...Array(g).fill({ estado: "ganho", origem: "landing", inquilinoId: null }),
      ...Array(p).fill({ estado: "perdido", origem: "landing", inquilinoId: null }),
      ...Array(a).fill({ estado: "novo", origem: "landing", inquilinoId: null }),
    ];
    expect(conversaoLeads(leads(2, 3, 4))).toEqual({
      ganhos: 2,
      perdidos: 3,
      abertos: 4,
      taxa: null,
    });
    expect(conversaoLeads(leads(4, 6)).taxa).toBe(0.4);
  });
});
