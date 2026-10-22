import { describe, expect, it } from "vitest";
import { minutosAte } from "@/lib/formatacao/datas";
import { estaAberta } from "./horario";

const horario = {
  hora_abertura: "09:00:00",
  hora_fecho: "19:30:00",
  dias_descanso: [0, 1],
  aberto: true,
};

describe("estaAberta", () => {
  it("terça às 10h de Lisboa está aberta; às 19h30 já fechou", () => {
    expect(estaAberta(horario, new Date("2026-10-20T09:00:00Z"))).toBe(true); // 10:00 em Lisboa (verão)
    expect(estaAberta(horario, new Date("2026-10-20T18:30:00Z"))).toBe(false); // 19:30
  });

  it("dias de descanso e interruptor fechado", () => {
    expect(estaAberta(horario, new Date("2026-10-19T10:00:00Z"))).toBe(false); // segunda
    expect(estaAberta({ ...horario, aberto: false }, new Date("2026-10-20T10:00:00Z"))).toBe(false);
  });

  it("usa a hora de Lisboa depois da mudança de hora (inverno, UTC+0)", () => {
    expect(estaAberta(horario, new Date("2026-11-03T08:59:00Z"))).toBe(false);
    expect(estaAberta(horario, new Date("2026-11-03T09:00:00Z"))).toBe(true);
  });
});

describe("minutosAte", () => {
  it("arredonda para cima e nunca fica negativo", () => {
    const agora = new Date("2026-10-20T10:00:00Z");
    expect(minutosAte("2026-10-20T10:14:10Z", agora)).toBe(15);
    expect(minutosAte("2026-10-20T09:00:00Z", agora)).toBe(0);
  });
});
