import { describe, expect, it } from "vitest";
import {
  acaoVencida,
  colunaDoFunil,
  diasUteisEntre,
  leadIncompleto,
  leadParado,
  propostaAExpirar,
} from "./comercial";

describe("diasUteisEntre", () => {
  it("conta só os dias de semana depois do primeiro dia", () => {
    // 2026-10-23 é sexta: sábado e domingo não contam, segunda e terça sim.
    expect(diasUteisEntre("2026-10-23", "2026-10-27")).toBe(2);
    expect(diasUteisEntre("2026-10-23", "2026-10-23")).toBe(0);
  });

  it("não conta feriados", () => {
    expect(diasUteisEntre("2026-11-30", "2026-12-02", new Set(["2026-12-01"]))).toBe(1);
  });
});

describe("leadParado", () => {
  it("só os novos com mais de dois dias úteis", () => {
    expect(leadParado({ estado: "novo", criadoEm: "2026-10-23" }, "2026-10-27")).toBe(false);
    expect(leadParado({ estado: "novo", criadoEm: "2026-10-23" }, "2026-10-28")).toBe(true);
    expect(leadParado({ estado: "contactado", criadoEm: "2026-10-01" }, "2026-10-28")).toBe(false);
  });
});

describe("acaoVencida e propostaAExpirar", () => {
  it("a ação de ontem está vencida; a de hoje ainda não", () => {
    expect(acaoVencida("2026-10-23", "2026-10-24")).toBe(true);
    expect(acaoVencida("2026-10-24", "2026-10-24")).toBe(false);
    expect(acaoVencida(null, "2026-10-24")).toBe(false);
  });

  it("expira em 0 a 3 dias; já expirada ou mais longe não conta", () => {
    expect(propostaAExpirar("2026-10-27", "2026-10-24")).toBe(true);
    expect(propostaAExpirar("2026-10-24", "2026-10-24")).toBe(true);
    expect(propostaAExpirar("2026-10-28", "2026-10-24")).toBe(false);
    expect(propostaAExpirar("2026-10-23", "2026-10-24")).toBe(false);
  });
});

describe("leadIncompleto", () => {
  it("só os do site sem o passo 2", () => {
    expect(leadIncompleto({ origem: "landing", temPasso2: false })).toBe(true);
    expect(leadIncompleto({ origem: "landing", temPasso2: true })).toBe(false);
    expect(leadIncompleto({ origem: "whatsapp", temPasso2: false })).toBe(false);
  });
});

describe("coluna do funil (D-211)", () => {
  it("um lead que não está ganho fica no seu estado", () => {
    expect(colunaDoFunil("demo_marcada", undefined, "2026-11-04")).toBe("demo_marcada");
  });
  it("um contrato mensal fica sempre em pós-venda", () => {
    const g = { assinadoEm: "2025-01-10T10:00:00Z", periodicidade: "mensal" };
    expect(colunaDoFunil("ganho", g, "2026-11-04")).toBe("pos_venda");
  });
  it("um contrato anual fica 90 dias em pós-venda e depois volta a ganho", () => {
    const g = { assinadoEm: "2026-09-01T10:00:00Z", periodicidade: "anual" };
    expect(colunaDoFunil("ganho", g, "2026-11-04")).toBe("pos_venda");
    expect(colunaDoFunil("ganho", g, "2026-11-30")).toBe("ganho");
  });
});
