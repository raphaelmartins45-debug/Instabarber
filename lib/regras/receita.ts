import { calcularPrecoCent, type Periodicidade, type Plano, type RegimeIva } from "./mensalidade";

// Indicadores de receita do Admin (E.1), sempre pela fórmula única (D.7). Um plano anual conta
// na receita recorrente mensal como o valor do ano a dividir por 12.

export type BarbeariaFaturavel = {
  plano: string;
  periodicidade: string;
  profissionais_contratados: number;
  dominio_proprio: string | null;
  estado: string;
};

export function precoDaBarbearia(b: BarbeariaFaturavel, regime: RegimeIva) {
  return calcularPrecoCent(
    b.plano as Plano,
    b.profissionais_contratados,
    b.periodicidade as Periodicidade,
    !!b.dominio_proprio,
    regime,
  );
}

/** Receita recorrente mensal das barbearias ativas, com e sem IVA, em cêntimos. */
export function receitaMensal(
  barbearias: BarbeariaFaturavel[],
  regime: RegimeIva,
): { comIva: number; semIva: number } {
  return barbearias
    .filter((b) => b.estado === "ativo")
    .reduce(
      (soma, b) => {
        const p = precoDaBarbearia(b, regime);
        const meses = b.periodicidade === "anual" ? 12 : 1;
        return {
          comIva: soma.comIva + Math.round(p.comIva / meses),
          semIva: soma.semIva + Math.round(p.semIva / meses),
        };
      },
      { comIva: 0, semIva: 0 },
    );
}
