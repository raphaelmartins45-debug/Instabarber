import { describe, expect, it } from "vitest";
import { primeiroDiaMarcavel } from "./primeiro-dia";

// 4/11/2026 é quarta-feira; 8/11 é domingo; 9/11 é segunda.
const base = { fecho: "19:30:00", diasDescanso: [0, 1] };

describe("primeiroDiaMarcavel", () => {
  it("antes do fecho, é hoje", () => {
    expect(primeiroDiaMarcavel({ ...base, hoje: "2026-11-04", horaAgora: "18:59" })).toBe(
      "2026-11-04",
    );
  });
  it("depois do fecho, é amanhã", () => {
    expect(primeiroDiaMarcavel({ ...base, hoje: "2026-11-04", horaAgora: "19:30" })).toBe(
      "2026-11-05",
    );
  });
  it("salta os dias de descanso", () => {
    expect(primeiroDiaMarcavel({ ...base, hoje: "2026-11-07", horaAgora: "20:00" })).toBe(
      "2026-11-10",
    );
    expect(primeiroDiaMarcavel({ ...base, hoje: "2026-11-08", horaAgora: "10:00" })).toBe(
      "2026-11-10",
    );
  });
});
