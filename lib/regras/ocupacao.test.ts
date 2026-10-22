import { describe, expect, it } from "vitest";
import { minutosDisponiveis, minutosMarcados, ocupacaoPercent } from "./ocupacao";

const h = (hora: string) => new Date(`2026-10-22T${hora}:00Z`);
const i = (a: string, b: string) => ({ inicio: h(a), fim: h(b) });

describe("ocupação", () => {
  const janelas = [i("09:00", "13:00"), i("14:00", "19:00")];
  it("minutos de trabalho sem as ausências (sobrepostas contam uma vez)", () => {
    expect(minutosDisponiveis(janelas, [])).toBe(540);
    expect(minutosDisponiveis(janelas, [i("12:00", "15:00"), i("12:30", "14:30")])).toBe(420);
  });
  it("minutos marcados só dentro das janelas", () => {
    expect(minutosMarcados(janelas, [i("09:00", "09:30"), i("12:45", "14:15")])).toBe(60);
  });
  it("percentagem", () => {
    expect(ocupacaoPercent(270, 540)).toBe(50);
    expect(ocupacaoPercent(10, 0)).toBeNull();
  });
});
