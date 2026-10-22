import { describe, expect, it } from "vitest";
import { classificar, faturacaoARecuperar, frequenciaHabitual, ticketMedio } from "./classificacao";

const agora = new Date("2026-10-22T10:00:00Z");

describe("frequenciaHabitual", () => {
  it("com menos de três visitas usa 30 dias", () => {
    expect(frequenciaHabitual([])).toBe(30);
    expect(frequenciaHabitual(["2026-09-01T10:00:00Z", "2026-09-21T10:00:00Z"])).toBe(30);
  });
  it("média dos intervalos, ignorando os superiores a 180 dias", () => {
    expect(
      frequenciaHabitual([
        "2025-01-01T10:00:00Z",
        "2026-09-01T10:00:00Z",
        "2026-09-21T10:00:00Z",
        "2026-10-01T10:00:00Z",
      ]),
    ).toBe(15);
  });
  it("só intervalos inválidos: 30 dias", () => {
    expect(
      frequenciaHabitual(["2024-01-01T10:00:00Z", "2025-01-01T10:00:00Z", "2026-01-01T10:00:00Z"]),
    ).toBe(30);
  });
});

describe("classificar", () => {
  it("sem visitas: sem histórico", () => {
    expect(classificar([], agora).estado).toBe("sem_historico");
  });
  it("limites de 1,5 e 2 vezes a frequência (30 dias)", () => {
    const dias = (n: number) => new Date(agora.getTime() - n * 86_400_000).toISOString();
    expect(classificar([dias(44)], agora).estado).toBe("ativo");
    expect(classificar([dias(45)], agora).estado).toBe("em_risco");
    expect(classificar([dias(60)], agora).estado).toBe("em_risco");
    expect(classificar([dias(61)], agora).estado).toBe("perdido");
  });
  it("quem veio uma vez há quatro meses está perdido (D-22)", () => {
    const c = classificar(["2026-06-20T10:00:00Z"], agora);
    expect(c).toMatchObject({ estado: "perdido", diasSemVir: 124 });
  });
});

describe("faturação a recuperar e ticket médio", () => {
  it("só os perdidos, vezes 0,4", () => {
    expect(
      faturacaoARecuperar([
        { estado: "perdido", ticketMedioCent: 1500 },
        { estado: "perdido", ticketMedioCent: 2000 },
        { estado: "em_risco", ticketMedioCent: 9000 },
      ]),
    ).toBe(1400);
  });
  it("ticket médio arredondado ao cêntimo", () => {
    expect(ticketMedio([1000, 1500, 1501])).toBe(1334);
    expect(ticketMedio([])).toBe(0);
  });
});
