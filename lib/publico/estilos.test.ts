import { describe, expect, it } from "vitest";
import { estiloDe, nomeMonumento } from "./estilos";

describe("nomeMonumento", () => {
  it("um nome curto fica numa linha, grande, sem passar do máximo", () => {
    const r = nomeMonumento("Judah", "luxo");
    expect(r.linhas).toEqual(["Judah"]);
    expect(r.vw).toBeLessThanOrEqual(22);
    expect(r.vw).toBeGreaterThan(15);
  });
  it("um nome médio ocupa a largura numa só linha", () => {
    const r = nomeMonumento("Barber Club", "urbano");
    expect(r.linhas).toHaveLength(1);
    expect(r.vw * "Barber Club".length * 0.46).toBeLessThanOrEqual(92.01);
  });
  it("um nome comprido parte-se em duas linhas pelo espaço mais ao meio", () => {
    const r = nomeMonumento("Barbearia Ensaio InstaBarber", "classico");
    expect(r.linhas).toEqual(["Barbearia Ensaio", "InstaBarber"]);
  });
  it("um nome comprido sem espaços fica numa linha (mais pequeno)", () => {
    expect(nomeMonumento("Barbeariadosmeusamigos", "luxo").linhas).toHaveLength(1);
  });
});

describe("estiloDe", () => {
  it("valores desconhecidos ficam no clássico", () => {
    expect(estiloDe("neon")).toBe("classico");
    expect(estiloDe(null)).toBe("classico");
    expect(estiloDe("luxo")).toBe("luxo");
  });
});

describe("nomeMonumento no telemóvel", () => {
  it("uma palavra por linha, até três, e maior do que no ecrã largo", () => {
    const largo = nomeMonumento("Barber Club", "urbano");
    const estreito = nomeMonumento("Barber Club", "urbano", "estreito");
    expect(estreito.linhas).toEqual(["Barber", "Club"]);
    expect(estreito.vw).toBeGreaterThan(largo.vw);
  });
  it("mais de três palavras juntam-se em três linhas equilibradas", () => {
    expect(nomeMonumento("O Barbeiro do Bairro Alto", "classico", "estreito").linhas).toHaveLength(
      3,
    );
  });
});
