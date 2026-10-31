import { describe, expect, it } from "vitest";
import { resumoAuditoria, rotuloAcao } from "./resumo-auditoria";

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

describe("rotuloAcao e palavras lógicas", () => {
  it("usa o nome do dicionário e torna legível um código desconhecido", () => {
    expect(rotuloAcao("adesao_aprovada", { adesao_aprovada: "Adesão aprovada" })).toBe(
      "Adesão aprovada",
    );
    expect(rotuloAcao("leads_inativos_apagados", {})).toBe("Leads inativos apagados");
  });

  it("os sim e não substituem true e false quando se pedem", () => {
    expect(
      resumoAuditoria({ chave: "agenda", depois: { ativa: true } }, "—", {
        sim: "sim",
        nao: "não",
      }),
    ).toBe("agenda · ativa: sim");
  });
});
