import { describe, expect, it } from "vitest";
import { aplicarCondicoes, CONDICOES_DESLIGADAS, precoImplementacaoCent } from "./condicoes";

const ligadas = { ...CONDICOES_DESLIGADAS, descontosAtivos: true, taxaAtiva: true };

describe("aplicarCondicoes (D-161, D-189)", () => {
  it("com o interruptor desligado não há desconto nem implementação", () => {
    expect(
      aplicarCondicoes(
        { mensalidade: 20, taxa: 50, implementacao: "formacao" },
        CONDICOES_DESLIGADAS,
        false,
      ),
    ).toEqual({
      ok: true,
      descontoMensalidade: 0,
      implementacao: "nenhuma",
      descontoTaxa: 0,
      taxaCent: 0,
    });
  });

  it("ligadas, cobra o pacote escolhido com o desconto", () => {
    expect(
      aplicarCondicoes({ mensalidade: 20, taxa: 50, implementacao: "formacao" }, ligadas, false),
    ).toEqual({
      ok: true,
      descontoMensalidade: 20,
      implementacao: "formacao",
      descontoTaxa: 50,
      taxaCent: 5000,
    });
    expect(
      aplicarCondicoes({ mensalidade: 0, taxa: 0, implementacao: "essencial" }, ligadas, false),
    ).toMatchObject({ ok: true, taxaCent: 5000 });
  });

  it("sem implementação, o desconto na taxa não conta", () => {
    expect(
      aplicarCondicoes({ mensalidade: 0, taxa: 30, implementacao: "nenhuma" }, ligadas, false),
    ).toMatchObject({ ok: true, descontoTaxa: 0, taxaCent: 0 });
  });

  it("o comercial não passa dos limites; a Performa LAB pode", () => {
    expect(
      aplicarCondicoes({ mensalidade: 25, taxa: 0, implementacao: "nenhuma" }, ligadas, false),
    ).toEqual({ ok: false, erro: "desconto_acima_do_limite" });
    expect(
      aplicarCondicoes({ mensalidade: 0, taxa: 60, implementacao: "essencial" }, ligadas, false).ok,
    ).toBe(false);
    expect(
      aplicarCondicoes({ mensalidade: 30, taxa: 60, implementacao: "formacao" }, ligadas, true),
    ).toMatchObject({ ok: true, taxaCent: 4000 });
  });

  it("preço de cada pacote", () => {
    expect(precoImplementacaoCent(ligadas, "essencial", 0)).toBe(5000);
    expect(precoImplementacaoCent(ligadas, "formacao", 20)).toBe(8000);
    expect(precoImplementacaoCent(ligadas, "nenhuma", 20)).toBe(0);
  });
});
