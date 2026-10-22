import { describe, expect, it } from "vitest";
import { separadorContactos, separadorHorario, separadorIdentidade } from "./ficha-barbearia";

const identidade = {
  nome: "Barbearia Central",
  slug: "central",
  nif: "",
  responsavel: "",
  ano_abertura: "",
  descricao: "",
  historia: "",
  plano: "pro" as const,
  periodicidade: "mensal" as const,
  profissionais_contratados: "4",
  dominio_proprio: "",
};

describe("ficha da barbearia", () => {
  it("vazios passam a nulo e números a número", () => {
    const r = separadorIdentidade.parse(identidade);
    expect(r).toMatchObject({
      nif: null,
      dominio_proprio: null,
      profissionais_contratados: 4,
      ano_abertura: null,
    });
  });

  it("recusa slug reservado, Pro com 2 profissionais e domínio inválido", () => {
    expect(separadorIdentidade.safeParse({ ...identidade, slug: "admin" }).success).toBe(false);
    expect(
      separadorIdentidade.safeParse({ ...identidade, profissionais_contratados: "2" }).success,
    ).toBe(false);
    expect(
      separadorIdentidade.safeParse({ ...identidade, dominio_proprio: "não é domínio" }).success,
    ).toBe(false);
    expect(
      separadorIdentidade.parse({ ...identidade, dominio_proprio: "BarbeariaCentral.pt" })
        .dominio_proprio,
    ).toBe("barbeariacentral.pt");
  });

  it("telefones em E.164 e código postal 1234-567", () => {
    const base = {
      telefone: "912345678",
      whatsapp: "",
      email: "",
      cidade: "",
      morada: "",
      codigo_postal: "3500-111",
      instagram: "",
      facebook: "",
      tiktok: "",
      google_maps_url: "",
      google_avaliacao_url: "",
      livro_reclamacoes_url: "",
    };
    expect(separadorContactos.parse(base)).toMatchObject({
      telefone: "+351912345678",
      whatsapp: null,
    });
    expect(separadorContactos.safeParse({ ...base, codigo_postal: "3500" }).success).toBe(false);
  });

  it("horário: fecho depois da abertura e intervalo da agenda permitido", () => {
    const h = {
      hora_abertura: "09:00",
      hora_fecho: "19:30",
      intervalo_almoco_inicio: "",
      intervalo_almoco_fim: "",
      dias_descanso: [0],
      fecha_feriados: true,
      granularidade_min: "30",
      intervalo_marcacoes_min: "0",
      antecedencia_minima_min: "60",
      antecedencia_cancelamento_min: "120",
      janela_marcacao_dias: "60",
      aberto: true,
    };
    expect(separadorHorario.safeParse(h).success).toBe(true);
    expect(separadorHorario.safeParse({ ...h, hora_fecho: "08:00" }).success).toBe(false);
    expect(separadorHorario.safeParse({ ...h, granularidade_min: "25" }).success).toBe(false);
  });
});
