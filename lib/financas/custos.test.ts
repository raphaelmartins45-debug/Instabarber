import { describe, expect, it } from "vitest";
import {
  alertasContas,
  ativoNoMes,
  contasParaGerar,
  type Custo,
  custoDaConta,
  custosDoMes,
  equivalenteMensalCent,
} from "./custos";

const custo = (c: Partial<Custo>): Custo => ({
  id: "c1",
  descricao: "Supabase Pro",
  categoria: "infraestrutura",
  tipo: "fixo",
  valorSemIvaCent: 2300,
  periodicidade: "mensal",
  dataInicio: "2026-10-15",
  dataFim: null,
  ativo: true,
  ...c,
});

describe("custos", () => {
  it("equivalente mensal: anual a dividir por 12, único fora", () => {
    expect(equivalenteMensalCent(custo({}))).toBe(2300);
    expect(equivalenteMensalCent(custo({ periodicidade: "anual", valorSemIvaCent: 1000 }))).toBe(
      83,
    );
    expect(equivalenteMensalCent(custo({ periodicidade: "unico" }))).toBe(0);
  });

  it("ativo no mês conforme o início, o fim e o interruptor", () => {
    expect(ativoNoMes(custo({}), "2026-10")).toBe(true);
    expect(ativoNoMes(custo({}), "2026-09")).toBe(false);
    expect(ativoNoMes(custo({ dataFim: "2026-11-30" }), "2026-12")).toBe(false);
    expect(ativoNoMes(custo({ ativo: false }), "2026-10")).toBe(false);
  });

  it("custos do mês separam fixos e variáveis", () => {
    const r = custosDoMes(
      [custo({}), custo({ id: "c2", tipo: "variavel", valorSemIvaCent: 500 })],
      "2026-11",
    );
    expect(r).toEqual({ fixos: 2300, variaveis: 500, total: 2800 });
  });

  it("a conta conta sem IVA no regime normal e com IVA no isento", () => {
    expect(custoDaConta({ semIvaCent: 1000, comIvaCent: 1230 }, "normal")).toBe(1000);
    expect(custoDaConta({ semIvaCent: 1000, comIvaCent: 1230 }, "isento")).toBe(1230);
  });

  it("gera as contas do mês sem duplicar e só os anuais no mês de aniversário", () => {
    const custos = [
      custo({ dataInicio: "2026-01-31" }),
      custo({ id: "c2", periodicidade: "anual", valorSemIvaCent: 1000, dataInicio: "2026-02-10" }),
      custo({ id: "c3", periodicidade: "unico" }),
      custo({ id: "c4", valorSemIvaCent: 0 }),
    ];
    const fev = contasParaGerar(custos, "2027-02", []);
    expect(fev.map((c) => [c.custoId, c.vencimento, c.valorComIvaCent])).toEqual([
      ["c1", "2027-02-28", 2829],
      ["c2", "2027-02-10", 1230],
    ]);
    expect(
      contasParaGerar(custos, "2027-03", [{ custoId: "c1", vencimento: "2027-03-31" }]),
    ).toEqual([]);
  });

  it("alertas: pendentes até ao limite e atrasadas", () => {
    const r = alertasContas(
      [
        { vencimento: "2026-10-30", estado: "pendente" },
        { vencimento: "2026-11-15", estado: "pendente" },
        { vencimento: "2026-10-01", estado: "atrasada" },
        { vencimento: "2026-10-25", estado: "paga" },
      ],
      "2026-10-31",
    );
    expect(r).toEqual({ aVencer: 1, atrasadas: 1 });
  });
});
