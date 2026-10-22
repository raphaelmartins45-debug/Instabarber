import { describe, expect, it } from "vitest";
import { montarAcerto } from "./acertos";
import { comissoesPagas, faturacaoServicos, receitaBarbearia, resumoMes } from "./financeiro";

describe("financeiro", () => {
  const a = montarAcerto("A", [{ valorCobradoCent: 10000, comissaoCent: 5000, clube: false }]);
  const b = montarAcerto("B", [
    { valorCobradoCent: 8000, comissaoCent: 4000, clube: false },
    { valorCobradoCent: 0, comissaoCent: 1000, clube: true },
  ]);
  const c = montarAcerto("C", [{ valorCobradoCent: 6000, comissaoCent: 0, clube: false }], 30000);

  it("faturação de serviços soma tudo o que foi cobrado, em todos os modelos", () => {
    expect(faturacaoServicos([{ valorCobradoCent: 10000 }, { valorCobradoCent: 8000 }])).toBe(
      18000,
    );
  });

  it("receita da barbearia: própria A + casa B + renda C + clube + loja − comissões", () => {
    // A: 10000 − 5000; B: 4000 − 1000; C: 30000; clube 2500; loja 1000.
    expect(
      receitaBarbearia({
        visitasModeloA: [{ valorCobradoCent: 10000 }],
        acertos: [a, b, c],
        mensalidadesClubeCent: 2500,
        lojaSemIvaCent: 1000,
      }),
    ).toBe(41500);
    expect(comissoesPagas([a, b, c])).toBe(6000);
  });

  it("resumo do mês e margem", () => {
    expect(
      resumoMes({
        faturacaoCent: 24000,
        receitaCent: 41500,
        comissoesCent: 6000,
        custosCent: 20000,
        despesasCent: 1500,
      }),
    ).toMatchObject({ resultadoCent: 20000, margem: 48.2 });
    expect(
      resumoMes({
        faturacaoCent: 0,
        receitaCent: 0,
        comissoesCent: 0,
        custosCent: 0,
        despesasCent: 0,
      }).margem,
    ).toBeNull();
  });
});
