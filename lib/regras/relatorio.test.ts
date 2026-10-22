import { describe, expect, it } from "vitest";
import {
  antecedenciaMedia,
  combinacaoMaisProcurada,
  retencao,
  servicosDoPeriodo,
  taxaFaltas,
  variacaoPercent,
  type VisitaRelatorio,
} from "./relatorio";

const v = (
  clienteId: string,
  data: string,
  valor = 1500,
  servicoId = "corte",
): VisitaRelatorio => ({
  clienteId,
  servicoId,
  profissionalId: "p1",
  data: `${data}T10:00:00Z`,
  valorCobradoCent: valor,
});
const outubro = { de: new Date("2026-10-01T00:00:00Z"), ate: new Date("2026-11-01T00:00:00Z") };

describe("variacaoPercent", () => {
  it("com uma casa e nula sem mês anterior", () => {
    expect(variacaoPercent(1100, 1000)).toBe(10);
    expect(variacaoPercent(500, 0)).toBeNull();
  });
});

describe("retencao (E.5)", () => {
  // Ana: cliente antiga que estava perdida e voltou depois da mensagem; Bruno: novo;
  // Carla: estava em risco e voltou sozinha; Duarte: perdido no fim do mês.
  const visitas = [
    v("ana", "2026-05-01"),
    v("ana", "2026-05-31"),
    v("ana", "2026-06-30"),
    v("ana", "2026-10-10", 2000),
    v("bruno", "2026-10-05"),
    v("carla", "2026-08-01"),
    v("carla", "2026-08-31"),
    v("carla", "2026-09-30"),
    v("carla", "2026-11-15"),
    v("duarte", "2026-01-01"),
  ];
  const mensagens = [{ clienteId: "ana", abertaEm: "2026-10-01T09:00:00Z" }];
  const r = retencao(visitas, outubro, mensagens, new Date("2026-12-01T00:00:00Z"));

  it("conta atendidos e novos do mês", () => {
    expect(r.atendidos).toBe(2);
    expect(r.novos).toBe(1);
  });
  it("a visita depois da mensagem conta como recuperada, com o valor cobrado", () => {
    expect(r.recuperados).toBe(1);
    expect(r.recuperadaCent).toBe(2000);
    expect(r.voltaramSozinhos).toBe(0);
  });
  it("classifica no fim do mês, sem as visitas seguintes", () => {
    expect(r.ativos).toBe(3);
    expect(r.perdidos).toBe(1);
    expect(r.aRecuperarCent).toBe(600);
  });
  it("sem mensagem, quem volta conta como regresso sozinho", () => {
    const s = retencao(visitas, outubro, [], new Date("2026-12-01T00:00:00Z"));
    expect(s.recuperadaCent).toBe(0);
    expect(s.voltaramSozinhos).toBe(1);
  });
});

describe("servicosDoPeriodo", () => {
  it("quantidade, receita e peso, do maior para o menor", () => {
    const l = servicosDoPeriodo([
      v("a", "2026-10-01", 1500),
      v("b", "2026-10-02", 1500),
      v("c", "2026-10-03", 1000, "barba"),
    ]);
    expect(l).toEqual([
      { servicoId: "corte", quantidade: 2, receitaCent: 3000, peso: 75 },
      { servicoId: "barba", quantidade: 1, receitaCent: 1000, peso: 25 },
    ]);
  });
});

describe("combinacaoMaisProcurada", () => {
  it("o par feito mais vezes no mesmo dia pelo mesmo cliente", () => {
    expect(
      combinacaoMaisProcurada([
        v("a", "2026-10-01", 1500, "corte"),
        v("a", "2026-10-01", 1000, "barba"),
        v("b", "2026-10-02", 1500, "corte"),
        v("b", "2026-10-02", 1000, "barba"),
        v("c", "2026-10-03", 1500, "corte"),
      ]),
    ).toEqual(["barba", "corte"]);
  });
  it("sem pares, nulo", () => {
    expect(combinacaoMaisProcurada([v("a", "2026-10-01")])).toBeNull();
  });
});

describe("operação", () => {
  it("taxa de faltas sobre concluídas e faltas", () => {
    expect(taxaFaltas(["concluida", "concluida", "concluida", "falta", "cancelada"])).toBe(25);
    expect(taxaFaltas([])).toBeNull();
  });
  it("antecedência média em dias", () => {
    expect(
      antecedenciaMedia([
        { criadoEm: "2026-10-01T10:00:00Z", inicio: "2026-10-03T10:00:00Z" },
        { criadoEm: "2026-10-01T10:00:00Z", inicio: "2026-10-02T10:00:00Z" },
      ]),
    ).toBe(1.5);
  });
});
