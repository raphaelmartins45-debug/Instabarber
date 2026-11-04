import { describe, expect, it } from "vitest";
import { instanteLocal } from "@/lib/formatacao/datas";
import { faturacaoPorDia, posicaoNoDia, totaisPor } from "./painel-inicio";

describe("faturacaoPorDia", () => {
  it("soma por dia de Lisboa e devolve todos os dias, mesmo os vazios", () => {
    const r = faturacaoPorDia(
      [
        { data: instanteLocal("2026-11-03", "10:00").toISOString(), valorCobradoCent: 1500 },
        { data: instanteLocal("2026-11-03", "23:30").toISOString(), valorCobradoCent: 1000 },
        { data: instanteLocal("2026-11-04", "09:00").toISOString(), valorCobradoCent: 2200 },
      ],
      "2026-11-04",
      3,
    );
    expect(r).toEqual([
      { dia: "2026-11-02", cent: 0 },
      { dia: "2026-11-03", cent: 2500 },
      { dia: "2026-11-04", cent: 2200 },
    ]);
  });
});

describe("totaisPor", () => {
  it("agrupa, ignora a chave nula e ordena do maior para o menor", () => {
    const r = totaisPor(
      [
        { p: "a", valorCobradoCent: 100 },
        { p: "b", valorCobradoCent: 300 },
        { p: "a", valorCobradoCent: 250 },
        { p: null, valorCobradoCent: 999 },
      ],
      (l) => l.p,
    );
    expect(r).toEqual([
      { id: "a", cent: 350 },
      { id: "b", cent: 300 },
    ]);
  });
});

describe("posicaoNoDia", () => {
  const dia = "2026-11-04";
  it("um serviço às 14:00 de 30 min, num dia das 09:00 às 19:00", () => {
    const r = posicaoNoDia(
      { inicio: instanteLocal(dia, "14:00"), fim: instanteLocal(dia, "14:30") },
      dia,
      "09:00:00",
      "19:00",
    );
    expect(r?.esquerda).toBeCloseTo(50);
    expect(r?.largura).toBeCloseTo(5);
  });
  it("corta o que sai do horário e ignora o que fica de fora", () => {
    expect(
      posicaoNoDia(
        { inicio: instanteLocal(dia, "08:00"), fim: instanteLocal(dia, "10:00") },
        dia,
        "09:00",
        "19:00",
      )?.largura,
    ).toBeCloseTo(10);
    expect(
      posicaoNoDia(
        { inicio: instanteLocal(dia, "19:00"), fim: instanteLocal(dia, "20:00") },
        dia,
        "09:00",
        "19:00",
      ),
    ).toBeNull();
  });
});
