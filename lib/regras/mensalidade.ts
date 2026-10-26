// Mensalidade da plataforma (D.5, D.7). Uma só fórmula para o formulário de adesão, o
// painel de administração e o registo de recebimentos. Trabalha em cêntimos.
// O Pro inclui 3 profissionais (D-72, que prevalece sobre o exemplo de código da D.7).

export type Plano = "basic" | "pro";
export type Periodicidade = "mensal" | "anual";
export type RegimeIva = "normal" | "isento"; // PRESTADORA_REGIME_IVA (D-45, D-85)

// Pro a 39,99 € (dono, 26/10/2026, D-173).
const BASE_CENT: Record<Plano, number> = { basic: 1999, pro: 3999 };
export const INCLUIDOS: Record<Plano, number> = { basic: 1, pro: 3 };
export const EXTRA_CENT: Record<Plano, number> = { basic: 0, pro: 1000 };
export const DOMINIO_PROPRIO_CENT = 500;
export const TAXA_IVA = 0.23;
export const MESES_NO_ANUAL = 10;

export function calcularMensalidadeCent(
  plano: Plano,
  nProfissionais: number,
  dominioProprio = false,
): number {
  if (!Number.isInteger(nProfissionais)) throw new Error("profissionais_invalido");
  if (plano === "basic" && nProfissionais !== 1) throw new Error("basic_um_profissional");
  if (plano === "pro" && nProfissionais < INCLUIDOS.pro) throw new Error("pro_minimo_tres");
  const extras = Math.max(0, nProfissionais - INCLUIDOS[plano]);
  return (
    BASE_CENT[plano] + extras * EXTRA_CENT[plano] + (dominioProprio ? DOMINIO_PROPRIO_CENT : 0)
  );
}

export type Preco = {
  /** Valor sem IVA (no regime isento é igual ao preço final). */
  semIva: number;
  /** Preço final que a barbearia paga, igual em qualquer regime. */
  comIva: number;
  ivaTaxa: 0 | 23;
};

/** Um valor com o desconto em percentagem inteira (D-161), arredondado ao cêntimo. */
export function comDescontoCent(valorCent: number, descontoPct: number): number {
  if (!Number.isInteger(descontoPct) || descontoPct < 0 || descontoPct > 100)
    throw new Error("desconto_invalido");
  return Math.round((valorCent * (100 - descontoPct)) / 100);
}

export function calcularPrecoCent(
  plano: Plano,
  nProfissionais: number,
  periodicidade: Periodicidade,
  dominioProprio = false,
  regime: RegimeIva = "normal",
  descontoPct = 0,
): Preco {
  // O desconto da proposta aceite aplica-se à mensalidade, antes do período e do IVA (D-161).
  const mensal = comDescontoCent(
    calcularMensalidadeCent(plano, nProfissionais, dominioProprio),
    descontoPct,
  );
  const valor = periodicidade === "anual" ? mensal * MESES_NO_ANUAL : mensal;
  // Isento (art. 53.º do CIVA): ao preço não acresce IVA (D-173, substitui a opção B da D-45).
  if (regime === "isento") return { semIva: valor, comIva: valor, ivaTaxa: 0 };
  return { semIva: valor, comIva: Math.round(valor * (1 + TAXA_IVA)), ivaTaxa: 23 };
}

/** Os profissionais além dos incluídos, para a conta em linguagem corrente (D.6). */
export function profissionaisExtra(
  plano: Plano,
  nProfissionais: number,
): { extras: number; valorCent: number } {
  const extras = Math.max(0, nProfissionais - INCLUIDOS[plano]);
  return { extras, valorCent: extras * EXTRA_CENT[plano] };
}

export function lerRegimeIva(valor: string | undefined): RegimeIva {
  return valor === "isento" ? "isento" : "normal";
}
