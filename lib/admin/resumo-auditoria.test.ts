import { describe, expect, it } from "vitest";
import { resumoAuditoria } from "./resumo-auditoria";

describe("resumoAuditoria", () => {
  it("mostra só os campos que mudaram, sem carimbos técnicos", () => {
    expect(
      resumoAuditoria(
        {
          chave: "ficha_tecnica",
          antes: { ativa: false, bonus: false, alterado_em: "x", inquilino_id: "y" },
          depois: { ativa: true, bonus: false, alterado_em: "z", inquilino_id: "y" },
        },
        "—",
      ),
    ).toBe("ficha_tecnica · ativa: false → true");
  });

  it("num registo novo lista os valores criados", () => {
    expect(
      resumoAuditoria(
        { antes: null, chave: "agenda", depois: { chave: "agenda", ativa: true } },
        "—",
      ),
    ).toBe("agenda · ativa: true");
  });

  it("detalhes simples e vazios", () => {
    expect(resumoAuditoria({ justificacao: "Apoio" }, "—")).toBe("justificacao: Apoio");
    expect(resumoAuditoria(null, "—")).toBe("—");
    expect(resumoAuditoria({}, "—")).toBe("—");
  });
});
