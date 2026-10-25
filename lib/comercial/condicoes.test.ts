import { describe, expect, it } from "vitest";
import { aplicarCondicoes, CONDICOES_DESLIGADAS } from "./condicoes";

const ligadas = {
  ...CONDICOES_DESLIGADAS,
  descontosAtivos: true,
  taxaAtiva: true,
  taxaBaseCent: 20000,
};

describe("aplicarCondicoes", () => {
  it("com o interruptor desligado não há desconto nem taxa", () => {
    expect(aplicarCondicoes({ mensalidade: 20, taxa: 50 }, CONDICOES_DESLIGADAS, false)).toEqual({
      ok: true,
      descontoMensalidade: 0,
      descontoTaxa: 0,
      taxaCent: 0,
    });
  });

  it("ligadas, aplica o desconto e calcula a taxa com o desconto", () => {
    expect(aplicarCondicoes({ mensalidade: 20, taxa: 50 }, ligadas, false)).toEqual({
      ok: true,
      descontoMensalidade: 20,
      descontoTaxa: 50,
      taxaCent: 10000,
    });
  });

  it("o comercial não passa dos limites; a Performa LAB pode", () => {
    expect(aplicarCondicoes({ mensalidade: 25, taxa: 0 }, ligadas, false)).toEqual({
      ok: false,
      erro: "desconto_acima_do_limite",
    });
    expect(aplicarCondicoes({ mensalidade: 0, taxa: 60 }, ligadas, false).ok).toBe(false);
    expect(aplicarCondicoes({ mensalidade: 30, taxa: 60 }, ligadas, true)).toMatchObject({
      ok: true,
      taxaCent: 8000,
    });
  });
});
