import { describe, expect, it } from "vitest";
import { telefoneE164 } from "./telefone";

describe("telefoneE164", () => {
  it("normaliza números portugueses", () => {
    expect(telefoneE164("912 345 678")).toBe("+351912345678");
    expect(telefoneE164("+351 912-345-678")).toBe("+351912345678");
    expect(telefoneE164("351232000000")).toBe("+351232000000");
  });

  it("recusa o que não é um número português de nove dígitos", () => {
    expect(telefoneE164("812345678")).toBeNull();
    expect(telefoneE164("91234567")).toBeNull();
    expect(telefoneE164("+34912345678")).toBeNull();
    expect(telefoneE164("")).toBeNull();
  });
});
