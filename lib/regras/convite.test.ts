import { describe, expect, it } from "vitest";
import { estadoConvite } from "./convite";

const agora = new Date("2026-10-22T12:00:00Z");

describe("estadoConvite", () => {
  it("quem já entrou está ativo", () => {
    expect(estadoConvite("2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z", agora)).toBe("ativo");
  });

  it("antes das 24 horas aguarda; depois aparece «Reenviar convite»", () => {
    expect(estadoConvite("2026-10-21T12:30:00Z", null, agora)).toBe("aguarda");
    expect(estadoConvite("2026-10-21T12:00:00Z", null, agora)).toBe("reenviar");
  });
});
