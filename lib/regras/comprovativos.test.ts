import { describe, expect, it } from "vitest";
import { estadoFatura, extensaoComprovativo } from "./comprovativos";

describe("comprovativos", () => {
  it("aceita JPG, PNG e PDF até 5 MB", () => {
    expect(extensaoComprovativo({ type: "image/jpeg", size: 1000 })).toBe("jpg");
    expect(extensaoComprovativo({ type: "image/png", size: 5 * 1024 * 1024 })).toBe("png");
    expect(extensaoComprovativo({ type: "application/pdf", size: 10 })).toBe("pdf");
    expect(extensaoComprovativo({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).toBeNull();
    expect(extensaoComprovativo({ type: "image/webp", size: 10 })).toBeNull();
    expect(extensaoComprovativo({ type: "application/pdf", size: 0 })).toBeNull();
  });

  it("estado da fatura: paga, em análise ou por pagar", () => {
    const pendentes = new Set(["f2"]);
    expect(estadoFatura({ id: "f1", paga_em: "2026-10-01" }, pendentes)).toBe("paga");
    expect(estadoFatura({ id: "f2", paga_em: null }, pendentes)).toBe("emAnalise");
    expect(estadoFatura({ id: "f3", paga_em: null }, pendentes)).toBe("porPagar");
  });
});
