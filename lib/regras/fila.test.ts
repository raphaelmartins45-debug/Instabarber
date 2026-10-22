import { describe, expect, it } from "vitest";
import { esperaEstimada } from "./fila";

describe("esperaEstimada (F.4.3)", () => {
  it("reparte os minutos pelos profissionais, arredondando para cima", () => {
    expect(esperaEstimada({ minutosAFrente: 30, minutosEmCurso: 15, profissionais: 2 })).toBe(23);
  });
  it("sem ninguém à frente nem em curso, zero", () => {
    expect(esperaEstimada({ minutosAFrente: 0, minutosEmCurso: 0, profissionais: 3 })).toBe(0);
  });
  it("sem profissionais ativos, conta como um", () => {
    expect(esperaEstimada({ minutosAFrente: 20, minutosEmCurso: 0, profissionais: 0 })).toBe(20);
  });
});
