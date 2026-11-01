import { describe, expect, it } from "vitest";
import { destinoDoGuia } from "./destino";

describe("destinoDoGuia", () => {
  it("usa o e-mail da ficha da barbearia quando existe", () => {
    expect(destinoDoGuia("barbearia@exemplo.pt", "dono@exemplo.pt")).toBe("barbearia@exemplo.pt");
  });
  it("sem e-mail na ficha, usa o da conta do proprietário", () => {
    expect(destinoDoGuia(null, "dono@exemplo.pt")).toBe("dono@exemplo.pt");
    expect(destinoDoGuia("  ", "dono@exemplo.pt")).toBe("dono@exemplo.pt");
  });
  it("sem nenhum, não há destino", () => {
    expect(destinoDoGuia(null, undefined)).toBeNull();
  });
});
