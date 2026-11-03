import { describe, expect, it } from "vitest";
import { ACABAMENTO, ESTILOS, estiloDe, nomeMonumento } from "./estilos";

describe("nomeMonumento", () => {
  it("um nome curto fica numa linha, grande, sem passar do máximo", () => {
    const r = nomeMonumento("Judah", "cartao");
    expect(r.linhas).toEqual(["Judah"]);
    expect(r.vw).toBe(22);
    // A Imbue do Monumento é estreita: o máximo dela é maior, para o nome chegar às margens.
    expect(nomeMonumento("Judah", "monumento").vw).toBe(30);
  });
  it("um nome médio ocupa a largura útil numa só linha, sem a passar", () => {
    const r = nomeMonumento("Barber Club", "cartaz");
    expect(r.linhas).toHaveLength(1);
    expect(r.vw * "Barber Club".length * ACABAMENTO.cartaz.largura).toBeLessThanOrEqual(92.01);
  });
  it("um nome comprido parte-se em duas linhas pelo corte mais equilibrado", () => {
    expect(nomeMonumento("Barbearia Ensaio InstaBarber", "monumento").linhas).toEqual([
      "Barbearia Ensaio",
      "InstaBarber",
    ]);
  });
  it("um modelo pode dar ao nome só uma parte da largura", () => {
    const parte = nomeMonumento("Barber Club", "cartaz", "largo", { util: 62, maximo: 15 });
    const maior = Math.max(...parte.linhas.map((l) => l.length));
    expect(parte.vw * maior * ACABAMENTO.cartaz.largura).toBeLessThanOrEqual(62.01);
    expect(parte.vw).toBeLessThanOrEqual(15);
  });
});

describe("nomeMonumento no telemóvel", () => {
  it("uma palavra por linha, até três, e maior do que no ecrã largo", () => {
    const largo = nomeMonumento("Barber Club", "monumento");
    const estreito = nomeMonumento("Barber Club", "monumento", "estreito");
    expect(estreito.linhas).toEqual(["Barber", "Club"]);
    expect(estreito.vw).toBeGreaterThan(largo.vw);
  });
  it("mais de três palavras juntam-se em três linhas equilibradas", () => {
    expect(nomeMonumento("O Barbeiro do Bairro Alto", "anuario", "estreito").linhas).toHaveLength(
      3,
    );
  });
});

describe("estiloDe", () => {
  it("valores desconhecidos ficam no Monumento; há oito modelos", () => {
    expect(estiloDe("neon")).toBe("monumento");
    expect(estiloDe(null)).toBe("monumento");
    expect(estiloDe("vitrine")).toBe("vitrine");
    expect(ESTILOS).toHaveLength(8);
  });
});

describe("nome comprido no ecrã largo", () => {
  it("em duas linhas tem um teto de altura, para caber no primeiro ecrã", () => {
    const r = nomeMonumento("Barbearia Ensaio InstaBarber", "monumento");
    expect(r.linhas).toHaveLength(2);
    expect(r.vw).toBeLessThanOrEqual(12);
  });
});
