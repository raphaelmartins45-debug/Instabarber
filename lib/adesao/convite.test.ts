import { describe, expect, it } from "vitest";
import { VALORES_VAZIOS, valoresComConvite } from "./convite";

describe("valoresComConvite", () => {
  it("junta ao formulário vazio o que o convite traz", () => {
    const v = valoresComConvite({
      identidade: { nome: "Barbearia Lda", responsavel: "Rui", nif: "501964843" },
      contactos: { morada: "Rua A", email: "rui@exemplo.pt" },
      contratacao: {
        plano: "basic",
        periodicidade: "anual",
        profissionais: 1,
        email_acesso: "rui@exemplo.pt",
      },
    });
    expect(v.identidade.nome).toBe("Barbearia Lda");
    expect(v.identidade.descricao).toBe("");
    expect(v.contactos.morada).toBe("Rua A");
    expect(v.contactos.hora_abertura).toBe("09:00");
    expect(v.contratacao).toMatchObject({
      plano: "basic",
      periodicidade: "anual",
      profissionais: 1,
    });
    expect(v.servicos).toEqual(VALORES_VAZIOS.servicos);
  });

  it("ignora campos estranhos, vazios ou com tipo errado", () => {
    const v = valoresComConvite({
      identidade: { nome: "", palavra_passe: "x" },
      contratacao: { plano: "ouro", profissionais: "3" },
    });
    expect(v.identidade).toEqual(VALORES_VAZIOS.identidade);
    expect(v.contratacao).toEqual(VALORES_VAZIOS.contratacao);
  });

  it("sem convite devolve os valores vazios", () => {
    expect(valoresComConvite(null)).toEqual(VALORES_VAZIOS);
    expect(valoresComConvite("lixo")).toEqual(VALORES_VAZIOS);
  });
});
