import { describe, expect, it } from "vitest";
import { textoDeCentimos } from "@/lib/formatacao/dinheiro";
import { esquemaRegistoBarbearia } from "@/lib/validacao/registo-barbearia";
import {
  dadosDaProposta,
  type LeadParaRegisto,
  type PropostaParaRegisto,
} from "./registo-proposta";

const lead: LeadParaRegisto = {
  nome_contacto: "Rui Contacto",
  nome_barbearia: "Barbearia do Lead",
  email: "lead@exemplo.pt",
  telefone: "912345678",
  cidade: "Viseu",
  morada: "Rua do Lead, 1",
};
const proposta = (extra: Partial<PropostaParaRegisto> = {}): PropostaParaRegisto => ({
  plano: "pro",
  periodicidade: "anual",
  profissionais: 4,
  implementacao: "essencial",
  taxa_migracao_sem_iva: 45,
  campanha_id: null,
  dados: {
    briefing: {
      nome_comercial: "Barbearia Briefing",
      nif: "509999999",
      decisor_nome: "Ana Decisora",
      decisor_email: "Ana@Exemplo.pt",
      decisor_telemovel: "936000000",
      cidade: "",
      morada: "Rua do Briefing, 2",
    },
  },
  ...extra,
});

describe("dadosDaProposta", () => {
  it("usa o briefing da proposta e, onde está vazio, o lead", () => {
    const d = dadosDaProposta(proposta(), lead);
    expect(d).toMatchObject({
      nome: "Barbearia Briefing",
      responsavel: "Ana Decisora",
      email_acesso: "ana@exemplo.pt",
      telefone: "936000000",
      nif: "509999999",
      cidade: "Viseu",
      morada: "Rua do Briefing, 2",
    });
  });

  it("traz o plano, a periodicidade, os profissionais, a implementação com o valor e a campanha", () => {
    const d = dadosDaProposta(
      proposta({ campanha_id: "c0ffee00-0000-4000-8000-000000000001" }),
      lead,
    );
    expect(d).toMatchObject({
      plano: "pro",
      periodicidade: "anual",
      profissionais: 4,
      implementacao: "essencial",
      valor_implementacao: textoDeCentimos(4500),
      campanha_id: "c0ffee00-0000-4000-8000-000000000001",
    });
  });

  it("sem briefing, fica só com o lead; sem implementação, o valor é zero", () => {
    const d = dadosDaProposta(
      proposta({ dados: {}, implementacao: "nenhuma", taxa_migracao_sem_iva: 0 }),
      lead,
    );
    expect(d).toMatchObject({
      nome: "Barbearia do Lead",
      responsavel: "Rui Contacto",
      email_acesso: "lead@exemplo.pt",
      nif: "",
      implementacao: "nenhuma",
      valor_implementacao: textoDeCentimos(0),
    });
  });

  it("o resultado passa no esquema do registo", () => {
    const d = dadosDaProposta(proposta(), lead);
    expect(
      esquemaRegistoBarbearia.safeParse({ ...d, cortesia: false, cortesia_ate: "" }).success,
    ).toBe(true);
  });
});
