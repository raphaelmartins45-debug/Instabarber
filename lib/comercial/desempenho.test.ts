import { describe, expect, it } from "vitest";
import { desempenhoDoMes, progressoMeta } from "./desempenho";

const ana = "u-ana";
const leads = [
  { id: "l1", estado: "ganho", responsavel_id: ana, criado_em: "2026-10-02T10:00:00Z" },
  { id: "l2", estado: "proposta", responsavel_id: ana, criado_em: "2026-10-05T10:00:00Z" },
  { id: "l3", estado: "perdido", responsavel_id: ana, criado_em: "2026-09-05T10:00:00Z" },
  { id: "l4", estado: "novo", responsavel_id: "u-bruno", criado_em: "2026-10-06T10:00:00Z" },
];
const propostas = [
  { id: "p1", lead_id: "l1", criado_em: "2026-10-03T10:00:00Z" },
  { id: "p2", lead_id: "l2", criado_em: "2026-10-07T10:00:00Z" },
  { id: "p4", lead_id: "l4", criado_em: "2026-10-07T10:00:00Z" },
];
const contratos = [
  { lead_id: "l1", proposta_id: "p1", estado: "assinado", assinado_em: "2026-10-20" },
  { lead_id: "l4", proposta_id: "p4", estado: "assinado", assinado_em: "2026-10-21" },
];

describe("desempenhoDoMes", () => {
  it("conta só os leads do comercial, no mês", () => {
    expect(desempenhoDoMes(ana, "2026-10", leads, propostas, contratos)).toEqual({
      leadsNovos: 2,
      propostas: 2,
      ganhos: 1,
      abertos: 1,
      conversao: null,
    });
  });

  it("noutro mês os números são outros", () => {
    expect(desempenhoDoMes(ana, "2026-09", leads, propostas, contratos)).toMatchObject({
      leadsNovos: 1,
      propostas: 0,
      ganhos: 0,
    });
  });
});

describe("progressoMeta", () => {
  it("percentagem inteira; sem meta, nula", () => {
    expect(progressoMeta(3, 4)).toBe(75);
    expect(progressoMeta(5, 4)).toBe(125);
    expect(progressoMeta(1, 0)).toBeNull();
  });
});
