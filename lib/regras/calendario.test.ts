import { describe, expect, it } from "vitest";
import { ficheiroCalendario } from "./calendario";

describe("ficheiroCalendario", () => {
  it("evento em UTC, com texto escapado", () => {
    const ics = ficheiroCalendario({
      id: "abc",
      titulo: "Corte, com Rui",
      inicio: "2026-10-22T14:00:00Z",
      fim: "2026-10-22T14:30:00Z",
      local: "Rua Direita; Viseu",
      descricao: "Barbearia A",
      agora: new Date("2026-10-22T10:00:00Z"),
    });
    expect(ics).toContain("DTSTART:20261022T140000Z");
    expect(ics).toContain("DTEND:20261022T143000Z");
    expect(ics).toContain("SUMMARY:Corte\\, com Rui");
    expect(ics).toContain("LOCATION:Rua Direita\\; Viseu");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});
