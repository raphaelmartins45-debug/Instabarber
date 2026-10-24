import { describe, expect, it } from "vitest";
import { emFaltaParaProposta, esquemaBriefing, valorParaSiCent } from "./briefing";
import { montarProposta, profissionaisDoPlano } from "./proposta";

const catalogo = [
  { chave: "agenda_basica", nome: "Agenda e marcações", grupo: "operacao" },
  { chave: "lembretes_marcacao", nome: "Lembrete individual por WhatsApp", grupo: "presenca" },
  { chave: "clientes_perdidos", nome: "Radar de clientes perdidos", grupo: "retencao" },
];
const pacotes = {
  basic: ["agenda_basica", "lembretes_marcacao"],
  pro: ["agenda_basica", "lembretes_marcacao", "clientes_perdidos"],
};
const base = esquemaBriefing.parse({
  nome_comercial: "Corte Fino",
  n_barbeiros: 3,
  como_marcam: ["whatsapp"],
  clientes_ativos: 400,
  valor_visita_cent: 1500,
  dores: ["faltas", "desaparecem"],
  objetivo: "Reduzir faltas",
  decisor_nome: "Rui",
  decisor_telemovel: "912000111",
});

describe("briefing", () => {
  it("diz o que falta para gerar a proposta", () => {
    expect(emFaltaParaProposta(base)).toEqual([]);
    expect(emFaltaParaProposta(esquemaBriefing.parse({}))).toContain("nome_comercial");
  });

  it("«o que isto vale para si» só com os dois números (perdidos × visita × 0,4)", () => {
    expect(valorParaSiCent(base)).toBeNull();
    expect(valorParaSiCent({ ...base, clientes_perdidos: 22 })).toBe(13200);
  });
});

describe("montarProposta", () => {
  it("Pro mensal com 3 profissionais: 39,00 € sem IVA e 47,97 € com IVA (D.5)", () => {
    const p = montarProposta(base, catalogo, pacotes, "normal");
    expect(p.mensalidade_sem_iva).toBe("39.00");
    expect(p.valor_periodo_com_iva).toBe("47.97");
    expect(p.iva_taxa).toBe(23);
  });

  it("anual paga 10 meses; o domínio próprio entra na decomposição", () => {
    const p = montarProposta(
      { ...base, periodicidade: "anual", dominio_proprio: true },
      catalogo,
      pacotes,
      "normal",
    );
    expect(p.valor_periodo_sem_iva).toBe("440.00");
    expect(p.dados.decomposicao.at(-1)).toEqual({ rotulo: "dominio", valorCent: 5000 });
  });

  it("a solução só lista o que o plano inclui; o desafio só no Pro", () => {
    const basic = montarProposta(
      { ...base, plano: "basic", desafio_90: true },
      catalogo,
      pacotes,
      "normal",
    );
    expect(basic.profissionais).toBe(1);
    expect(basic.desafio_90).toBe(false);
    const desaparecem = basic.dados.solucao.find((s) => s.dor === "desaparecem")!;
    expect(desaparecem.funcionalidades).toEqual([]);
    const faltas = basic.dados.solucao.find((s) => s.dor === "faltas")!;
    expect(faltas.funcionalidades).toEqual(["Lembrete individual por WhatsApp"]);
  });

  it("o Pro tem pelo menos 2 profissionais", () => {
    expect(profissionaisDoPlano({ ...base, profissionais: 1 })).toBe(2);
  });
});
