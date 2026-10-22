import { describe, expect, it } from "vitest";
import { chavesEmFalta } from "./configuracao";
import { assinarSimulado, adaptadorSimulado } from "./simulado";

describe("pagamentos desligados (G.4)", () => {
  it("o interruptor geral diz que chaves faltam", () => {
    expect(chavesEmFalta("pagamentos", {})).toEqual([
      "PAGAMENTOS_FORNECEDOR",
      "PAGAMENTOS_CHAVE",
      "PAGAMENTOS_SEGREDO_WEBHOOK",
    ]);
    expect(
      chavesEmFalta("pagamentos", {
        PAGAMENTOS_FORNECEDOR: "simulado",
        PAGAMENTOS_CHAVE: "x",
        PAGAMENTOS_SEGREDO_WEBHOOK: "y",
      }),
    ).toEqual([]);
  });
  it("o webhook simulado só aceita eventos assinados", () => {
    const a = adaptadorSimulado("segredo");
    const corpo = JSON.stringify({ idExterno: "sim_1", estado: "pago" });
    expect(a.lerWebhook(corpo, assinarSimulado(corpo, "segredo"))).toEqual({
      idExterno: "sim_1",
      estado: "pago",
    });
    expect(a.lerWebhook(corpo, assinarSimulado(corpo, "outro"))).toBeNull();
    expect(a.lerWebhook(corpo, null)).toBeNull();
    const mau = JSON.stringify({ idExterno: "sim_1", estado: "roubado" });
    expect(a.lerWebhook(mau, assinarSimulado(mau, "segredo"))).toBeNull();
  });
  it("pedido, consulta e reembolso", async () => {
    const a = adaptadorSimulado("s");
    const p = await a.pedir({
      finalidade: "sinal",
      referenciaId: "m1",
      valorCent: 500,
      telefone: "+351912000000",
    });
    expect(p.estado).toBe("pendente");
    expect(await a.consultar(p.idExterno)).toBe("pendente");
    expect(await a.reembolsar(p.idExterno)).toBe("reembolsado");
    expect(await a.consultar("desconhecido")).toBe("expirado");
  });
});
