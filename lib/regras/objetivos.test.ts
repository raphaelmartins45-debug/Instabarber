import { describe, expect, it } from "vitest";
import {
  diasDeFuncionamento,
  faltaHoje,
  progressoObjetivo,
  type CalendarioBarbearia,
} from "./objetivos";

const base: CalendarioBarbearia = {
  diasDescanso: [0, 1],
  fechaFeriados: true,
  horaAbertura: "09:00:00",
  horaFecho: "19:30:00",
  feriadosNacionais: ["2026-10-05"],
  feriadosProprios: [],
  ausenciasBarbearia: [],
};

describe("diasDeFuncionamento", () => {
  it("outubro de 2026 sem domingos, segundas e o 5 de outubro", () => {
    // 31 dias; 4 domingos e 4 segundas; o 5 é segunda (já fora).
    expect(diasDeFuncionamento("2026-10", base)).toHaveLength(23);
  });
  it("feriado numa terça conta só se a barbearia fechar nos feriados", () => {
    const c = { ...base, feriadosNacionais: ["2026-12-08"] };
    expect(diasDeFuncionamento("2026-12", c)).not.toContain("2026-12-08");
    expect(diasDeFuncionamento("2026-12", { ...c, fechaFeriados: false })).toContain("2026-12-08");
  });
  it("feriados próprios e ausências da barbearia inteira; ausência de 2 horas não fecha", () => {
    const c: CalendarioBarbearia = {
      ...base,
      feriadosProprios: ["2026-10-06"],
      ausenciasBarbearia: [
        { inicio: "2026-10-07T00:00:00Z", fim: "2026-10-08T23:00:00Z" },
        { inicio: "2026-10-09T10:00:00Z", fim: "2026-10-09T12:00:00Z" },
      ],
    };
    const dias = diasDeFuncionamento("2026-10", c);
    expect(dias).not.toContain("2026-10-06");
    expect(dias).not.toContain("2026-10-07");
    expect(dias).not.toContain("2026-10-08");
    expect(dias).toContain("2026-10-09");
  });
});

describe("progressoObjetivo", () => {
  const dias = diasDeFuncionamento("2026-10", base);
  it("em falta, percentagem, diário e necessário por dia restante", () => {
    const p = progressoObjetivo(460000, 230000, dias, "2026-10-22");
    expect(p).toMatchObject({
      emFaltaCent: 230000,
      percentagem: 50,
      diasFuncionamento: 23,
      objetivoDiarioCent: 20000,
      diasRestantes: 8,
      necessarioPorDiaCent: 28750,
    });
  });
  it("objetivo ultrapassado: em falta zero", () => {
    expect(progressoObjetivo(1000, 1500, dias, "2026-10-22")).toMatchObject({
      emFaltaCent: 0,
      percentagem: 150,
      necessarioPorDiaCent: 0,
    });
  });
  it("falta hoje nunca é negativa", () => {
    expect(faltaHoje(20000, 5000)).toBe(15000);
    expect(faltaHoje(20000, 25000)).toBe(0);
  });
});
