import { describe, expect, it } from "vitest";
import { emCortesia } from "./cortesia";

describe("cortesia (D-189)", () => {
  it("sem cortesia, paga", () => {
    expect(emCortesia({}, "2026-11-03")).toBe(false);
    expect(emCortesia({ cortesia: false, cortesia_ate: null }, "2026-11-03")).toBe(false);
  });
  it("sem data, fica em cortesia até se desligar", () => {
    expect(emCortesia({ cortesia: true, cortesia_ate: null }, "2030-01-01")).toBe(true);
  });
  it("com data, conta até ao próprio dia do fim", () => {
    expect(emCortesia({ cortesia: true, cortesia_ate: "2026-12-31" }, "2026-12-31")).toBe(true);
    expect(emCortesia({ cortesia: true, cortesia_ate: "2026-12-31" }, "2027-01-01")).toBe(false);
  });
});
