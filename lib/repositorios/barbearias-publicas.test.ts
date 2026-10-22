import { describe, expect, it } from "vitest";
import { servicoPublicoDeLinha } from "./barbearias-publicas";

const linha = {
  id: "30000000-0000-0000-0000-000000000001",
  inquilino_id: "aaaaaaaa-0000-0000-0000-000000000000",
  nome: "Corte",
  nome_en: null,
  nome_fr: null,
  descricao: null,
  descricao_en: null,
  descricao_fr: null,
  categoria: null,
  duracao_min: 30,
  preco: 15.5,
  ordem: 0,
};

describe("serviço público", () => {
  it("troca o preço numeric por cêntimos inteiros", () => {
    const servico = servicoPublicoDeLinha(linha);
    expect(servico.preco_centimos).toBe(1550);
    expect(servico).not.toHaveProperty("preco");
    expect(servico.nome).toBe("Corte");
  });

  it("recusa um serviço sem preço", () => {
    expect(() => servicoPublicoDeLinha({ ...linha, preco: null })).toThrow();
  });
});
