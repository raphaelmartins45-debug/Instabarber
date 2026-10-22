import { describe, expect, it } from "vitest";
import { decomposicao, listaIncluida } from "./resumo";

describe("contratação (D.6, D.9)", () => {
  it("decomposição: base e extras, no anual vezes 10", () => {
    expect(decomposicao({ plano: "pro", periodicidade: "mensal", profissionais: 5 })).toEqual([
      { rotulo: "Plano base Pro", valorCent: 3900 },
      { rotulo: "2 profissional(is) extra", valorCent: 2000 },
    ]);
    expect(decomposicao({ plano: "basic", periodicidade: "anual", profissionais: 1 })).toEqual([
      { rotulo: "Plano base Basic", valorCent: 19990 },
    ]);
  });

  it("no Basic, o que é só do Pro aparece marcado como não incluído", () => {
    const catalogo = [
      { chave: "agenda_basica", nome: "Agenda", grupo: "operacao" },
      { chave: "loja_produtos", nome: "Loja", grupo: "receita" },
      { chave: "multilinguagem", nome: "PT, EN e FR", grupo: "presenca" },
    ];
    const pacotes = { basic: ["agenda_basica"], pro: ["agenda_basica", "loja_produtos"] };
    expect(listaIncluida(catalogo, pacotes, "basic").map((f) => [f.chave, f.incluida])).toEqual([
      ["agenda_basica", true],
      ["loja_produtos", false],
    ]);
    expect(listaIncluida(catalogo, pacotes, "pro").every((f) => f.incluida)).toBe(true);
  });
});
