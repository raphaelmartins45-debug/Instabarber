import { describe, expect, it } from "vitest";
import { nifValido } from "@/lib/validacao/nif";
import {
  camposEmAberto,
  completarDepoisDeGerar,
  esquemaContratante,
  substituirMarcadores,
} from "./contrato";

const NA = "Não aplicável";

describe("nifValido (igual a nif_valido na base de dados)", () => {
  it("aceita o dígito de controlo certo e recusa o resto", () => {
    expect(nifValido("123456789")).toBe(true);
    expect(nifValido("123456788")).toBe(false);
    expect(nifValido("423456789")).toBe(false);
    expect(nifValido("12345678")).toBe(false);
    expect(nifValido(null)).toBe(false);
  });
});

describe("substituirMarcadores (N.8)", () => {
  it("substitui, preenche os opcionais com «Não aplicável» e deixa o número para depois", () => {
    const r = substituirMarcadores(
      "{{contratante.razao_social}} · {{plano}} · {{desafio}} · {{contrato.numero}}",
      { "contratante.razao_social": "Corte Fino, Lda.", plano: "Pro" },
      NA,
    );
    expect(r).toEqual({
      ok: true,
      texto: "Corte Fino, Lda. · Pro · Não aplicável · {{contrato.numero}}",
    });
  });

  it("um marcador desconhecido ou um obrigatório vazio impedem a geração e dizem qual", () => {
    const r = substituirMarcadores(
      "{{plano}} {{inventado}} {{contratante.nif}}",
      { plano: "Pro" },
      NA,
    );
    expect(r).toEqual({ ok: false, desconhecidos: ["inventado"], emFalta: ["contratante.nif"] });
  });

  it("depois de gerar entram o número e o espaço da data de assinatura", () => {
    expect(
      completarDepoisDeGerar(
        "N.º {{contrato.numero}} em {{data_assinatura}}",
        "CTR-2026-0001",
        "___",
      ),
    ).toBe("N.º CTR-2026-0001 em ___");
  });
});

describe("esquemaContratante", () => {
  it("exige NIF válido, firma, morada, representante, cargo, e-mail e data de início", () => {
    const ok = esquemaContratante.safeParse({
      razao_social: "Corte Fino, Lda.",
      nif: "123456789",
      morada: "Rua A, Braga",
      representante: "Rui Lopes",
      cargo: "Gerente",
      email: "rui@cortefino.pt",
      data_inicio: "2026-11-01",
    });
    expect(ok.success).toBe(true);
    const semCargo = esquemaContratante.safeParse({ ...ok.data, cargo: "", email: "" });
    expect(semCargo.error?.issues.map((i) => i.message)).toEqual(["cargo", "email"]);
    const mau = esquemaContratante.safeParse({
      razao_social: "",
      nif: "123456788",
      morada: "",
      representante: "",
      data_inicio: "",
    });
    expect(mau.success).toBe(false);
  });
});

describe("camposEmAberto", () => {
  it("encontra os campos entre parênteses retos, sem repetir, e ignora ligações e comentários", () => {
    const texto =
      "Prazo de [30] dias. Foro: [a definir]. Outra vez [30].\n<!-- [nota] -->\nVer [Termos](https://x.pt).";
    expect(camposEmAberto(texto)).toEqual(["30", "a definir"]);
    expect(camposEmAberto("Sem campos em aberto.")).toEqual([]);
  });
});
