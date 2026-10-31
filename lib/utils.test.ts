import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("mantém o tamanho com nome ao lado de uma cor de texto", () => {
    expect(cn("text-mini", "text-terciario")).toBe("text-mini text-terciario");
    expect(cn("text-secao font-bold", "text-ligacao")).toBe("text-secao font-bold text-ligacao");
  });

  it("um tamanho substitui outro tamanho", () => {
    expect(cn("text-sm", "text-mini")).toBe("text-mini");
  });
});
