import { describe, expect, it } from "vitest";
import { telefoneE164 } from "./telefone";

describe("telefoneE164", () => {
  it("normaliza números portugueses", () => {
    expect(telefoneE164("912 345 678")).toBe("+351912345678");
    expect(telefoneE164("+351 912-345-678")).toBe("+351912345678");
    expect(telefoneE164("351232000000")).toBe("+351232000000");
    expect(telefoneE164("00351 912 345 678")).toBe("+351912345678");
  });

  it("aceita números de outros países com o indicativo (+ ou 00)", () => {
    expect(telefoneE164("+34 912 345 678")).toBe("+34912345678");
    expect(telefoneE164("+44 7911 123456")).toBe("+447911123456");
    expect(telefoneE164("0033 6 12 34 56 78")).toBe("+33612345678");
    expect(telefoneE164("+66 (81) 234-5678")).toBe("+66812345678");
  });

  it("recusa números incompletos, sem indicativo ou portugueses mal formados", () => {
    expect(telefoneE164("812345678")).toBeNull();
    expect(telefoneE164("91234567")).toBeNull();
    expect(telefoneE164("+351 81234567")).toBeNull();
    expect(telefoneE164("+1234567")).toBeNull();
    expect(telefoneE164("+0123456789")).toBeNull();
    expect(telefoneE164("+12345678901234567")).toBeNull();
    expect(telefoneE164("")).toBeNull();
  });
});
