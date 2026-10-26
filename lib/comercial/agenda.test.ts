import { describe, expect, it } from "vitest";
import { agendaDoDia } from "./agenda";

const hoje = "2026-11-12";
const lead = (id: string, extra: object) => ({
  id,
  nome: `Lead ${id}`,
  telefone: "+351912345678",
  estado: "contactado",
  proxima_acao: "Ligar",
  proxima_acao_em: null,
  ...extra,
});

describe("agendaDoDia", () => {
  it("riscos primeiro, depois ações vencidas (as mais atrasadas antes) e propostas a expirar", () => {
    const itens = agendaDoDia(
      [
        lead("a", { proxima_acao_em: "2026-11-12" }),
        lead("b", { proxima_acao_em: "2026-11-09" }),
        lead("c", { proxima_acao_em: "2026-11-20" }),
        lead("d", { proxima_acao_em: "2026-11-01", estado: "perdido" }),
        lead("e", {}),
      ],
      [
        { lead_id: "e", numero: "PRP-1", estado: "enviada", valida_ate: "2026-11-14" },
        { lead_id: "c", numero: "PRP-2", estado: "enviada", valida_ate: "2026-11-30" },
        { lead_id: "a", numero: "PRP-3", estado: "rascunho", valida_ate: "2026-11-13" },
      ],
      [{ inquilinoId: "i1", nome: "Barbearia X", telefone: null }],
      hoje,
    );
    expect(itens.map((i) => i.tipo)).toEqual(["risco", "acao", "acao", "proposta"]);
    expect(itens[1]).toMatchObject({ leadId: "b", atraso: 3 });
    expect(itens[3]).toMatchObject({ leadId: "e", numero: "PRP-1", dias: 2 });
  });

  it("lembra o fim do contrato atual nos 30 dias antes, o mais próximo primeiro", () => {
    const itens = agendaDoDia(
      [
        lead("f", { fim_contrato_atual: "2026-12-12" }),
        lead("g", { fim_contrato_atual: "2026-11-20" }),
        lead("h", { fim_contrato_atual: "2026-12-13" }),
        lead("i", { fim_contrato_atual: "2026-11-11" }),
        lead("j", { fim_contrato_atual: "2026-11-15", estado: "ganho" }),
      ],
      [],
      [],
      hoje,
    );
    expect(itens).toMatchObject([
      { tipo: "contrato", leadId: "g", dias: 8 },
      { tipo: "contrato", leadId: "f", dias: 30 },
    ]);
  });

  it("sem nada para hoje, a agenda está vazia", () => {
    expect(agendaDoDia([lead("c", { proxima_acao_em: "2026-12-01" })], [], [], hoje)).toEqual([]);
  });
});
