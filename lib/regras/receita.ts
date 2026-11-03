import { hojeIso } from "@/lib/formatacao/datas";
import { type ComCortesia, emCortesia } from "./cortesia";
import {
  calcularPrecoCent,
  comDescontoCent,
  INCLUIDOS,
  MESES_POR_PERIODO,
  type Periodicidade,
  type Plano,
  type RegimeIva,
} from "./mensalidade";

// Indicadores de receita do Admin (E.1), sempre pela fórmula única (D.7). Um plano anual conta
// na receita recorrente mensal como o valor do ano a dividir por 12. As barbearias em cortesia
// (D-189) não contam: não pagam.

export type BarbeariaFaturavel = ComCortesia & {
  plano: string;
  periodicidade: string;
  profissionais_contratados: number;
  dominio_proprio: string | null;
  estado: string;
  /** Desconto da proposta aceite (D-161); 0 por omissão. */
  desconto_mensalidade_pct?: number | string | null;
};

export function precoDaBarbearia(b: BarbeariaFaturavel, regime: RegimeIva) {
  return calcularPrecoCent(
    b.plano as Plano,
    b.profissionais_contratados,
    b.periodicidade as Periodicidade,
    !!b.dominio_proprio,
    regime,
    Number(b.desconto_mensalidade_pct ?? 0),
  );
}

/** Receita recorrente mensal das barbearias ativas, com e sem IVA, em cêntimos. */
export function receitaMensal(
  barbearias: BarbeariaFaturavel[],
  regime: RegimeIva,
  hoje: string = hojeIso(),
): { comIva: number; semIva: number } {
  return barbearias
    .filter((b) => b.estado === "ativo" && !emCortesia(b, hoje))
    .reduce(
      (soma, b) => {
        const p = precoDaBarbearia(b, regime);
        const meses = MESES_POR_PERIODO[b.periodicidade as Periodicidade] ?? 1;
        return {
          comIva: soma.comIva + Math.round(p.comIva / meses),
          semIva: soma.semIva + Math.round(p.semIva / meses),
        };
      },
      { comIva: 0, semIva: 0 },
    );
}

/**
 * O preço de um período com o ajuste da campanha (D-190): sem mensalidade no primeiro mês de
 * oferta, profissionais extra e domínio que não pagam, e desconto temporário sobre o resto.
 */
export function precoDoPeriodo(
  b: BarbeariaFaturavel,
  ajuste: {
    semMensalidade: boolean;
    descontoPct: number;
    profissionaisGratis: number;
    dominioGratis: boolean;
  },
  regime: RegimeIva,
) {
  if (ajuste.semMensalidade) return { semIva: 0, comIva: 0 };
  const plano = b.plano as Plano;
  const profissionais = Math.max(
    INCLUIDOS[plano],
    b.profissionais_contratados - ajuste.profissionaisGratis,
  );
  const p = calcularPrecoCent(
    plano,
    profissionais,
    b.periodicidade as Periodicidade,
    !!b.dominio_proprio && !ajuste.dominioGratis,
    regime,
    Number(b.desconto_mensalidade_pct ?? 0),
  );
  const d = Math.round(ajuste.descontoPct);
  return d > 0 ? { semIva: comDescontoCent(p.semIva, d), comIva: comDescontoCent(p.comIva, d) } : p;
}
