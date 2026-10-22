import { describe, expect, it } from "vitest";
import { separadorAtual } from "./menu";

describe("separadorAtual", () => {
  it("escolhe o separador pelo prefixo do caminho", () => {
    expect(separadorAtual("/admin")).toBe("inicio");
    expect(separadorAtual("/admin/barbearias/123/identidade")).toBe("barbearias");
    expect(separadorAtual("/admin/pedidos")).toBe("pedidos");
  });
});
