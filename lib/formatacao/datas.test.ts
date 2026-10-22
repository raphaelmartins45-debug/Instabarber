import { describe, expect, it } from "vitest";
import {
  diaSemanaDe,
  diasDesde,
  diasDoMes,
  diasEntreDatas,
  instanteLocal,
  mesAnterior,
  mesPorExtenso,
  somarDias,
} from "./datas";

describe("calendário", () => {
  it("dias entre datas e desde um instante (fuso de Lisboa)", () => {
    expect(diasEntreDatas("2026-10-01", "2026-10-22")).toBe(21);
    // 23:30 UTC do dia 21 já é dia 22 em Lisboa (hora de verão).
    expect(diasDesde("2026-10-21T23:30:00Z", new Date("2026-10-22T10:00:00Z"))).toBe(0);
  });
  it("dias do mês, dia da semana, soma de dias e mês anterior", () => {
    expect(diasDoMes("2026-02")).toHaveLength(28);
    expect(diaSemanaDe("2026-10-22")).toBe(4);
    expect(somarDias("2026-10-31", 1)).toBe("2026-11-01");
    expect(mesAnterior("2026-01")).toBe("2025-12");
    expect(mesPorExtenso("2026-10")).toBe("outubro de 2026");
  });
  it("instante local respeita a mudança de hora", () => {
    expect(instanteLocal("2026-10-24", "09:00").toISOString()).toBe("2026-10-24T08:00:00.000Z");
    expect(instanteLocal("2026-10-26", "09:00").toISOString()).toBe("2026-10-26T09:00:00.000Z");
  });
});
