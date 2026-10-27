import { describe, expect, it } from "vitest";
import { emFaltaParaProposta, esquemaBriefing } from "@/lib/comercial/briefing";
import { esquemaNovoLead } from "./comercial";
import { dividirPropostaRapida, esquemaPropostaRapida } from "./documentos";

const base = {
  nome_contacto: "Judah Silva",
  nome_barbearia: "Judah Barber",
  cidade: "Viseu",
  telefone: "912 345 678",
  email: "",
  origem: "visita" as const,
  consentimento_contacto: true,
  n_barbeiros: "3",
  como_marcam: ["whatsapp" as const],
  clientes_ativos: "250",
  valor_visita: "15",
  faltas_semana: "3",
  clientes_perdidos: "",
  dores: ["faltas" as const],
  objetivo: "Menos faltas",
  plano: "pro" as const,
  profissionais: "3",
  periodicidade: "mensal" as const,
  dominio_proprio: false,
  proxima_acao: "Ligar a saber da proposta",
  proxima_acao_em: "2026-11-03",
};

describe("proposta rápida", () => {
  it("divide num lead novo e num briefing completos para a proposta", () => {
    const { lead, briefing } = dividirPropostaRapida(esquemaPropostaRapida.parse(base));
    expect(esquemaNovoLead.safeParse(lead).success).toBe(true);
    const b = esquemaBriefing.parse(briefing);
    expect(emFaltaParaProposta(b)).toEqual([]);
    expect(b.valor_visita_cent).toBe(1500);
    expect(b.clientes_perdidos).toBeUndefined();
  });

  it("recusa sem telefone válido, sem dores e o Pro com menos de 3", () => {
    const r = esquemaPropostaRapida.safeParse({
      ...base,
      telefone: "123",
      dores: [],
      profissionais: "2",
    });
    expect(r.success).toBe(false);
    const caminhos = r.error!.issues.map((i) => i.path[0]);
    expect(caminhos).toEqual(expect.arrayContaining(["telefone", "dores", "profissionais"]));
  });

  it("na prospeção pede o consentimento", () => {
    const r = esquemaPropostaRapida.safeParse({ ...base, consentimento_contacto: false });
    expect(r.success).toBe(false);
  });

  it("o Basic leva sempre 1 profissional", () => {
    const { briefing } = dividirPropostaRapida(
      esquemaPropostaRapida.parse({ ...base, plano: "basic", profissionais: "1" }),
    );
    expect(briefing.profissionais).toBe(1);
  });
});
