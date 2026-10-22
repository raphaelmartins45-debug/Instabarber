// Loja (F.4.4): a margem calcula-se sempre sobre o preço sem IVA; o IVA não é receita.

export const TAXAS_IVA_LOJA = [6, 13, 23] as const;
export const TAXA_IVA_LOJA_OMISSAO = 23;

/** Preço sem IVA em cêntimos: preço de venda ÷ (1 + taxa). */
export function precoSemIva(precoVendaCent: number, ivaPercent: number): number {
  return Math.round((precoVendaCent * 100) / (100 + ivaPercent));
}

export type Margem = {
  semIvaCent: number;
  margemCent: number;
  percentagem: number;
  negativa: boolean;
};

/** Exemplo da F.4.4: custo 6,50 €, preço 12,00 €, IVA 23 % → 9,76 €, 3,26 €, 33,4 %. */
export function margemProduto(
  custoCent: number,
  precoVendaCent: number,
  ivaPercent: number,
): Margem {
  const semIvaCent = precoSemIva(precoVendaCent, ivaPercent);
  const margemCent = semIvaCent - custoCent;
  return {
    semIvaCent,
    margemCent,
    percentagem: semIvaCent > 0 ? Math.round((margemCent / semIvaCent) * 1000) / 10 : 0,
    negativa: margemCent < 0,
  };
}

export type EstadoStock = "em_stock" | "repor" | "esgotado";

export function estadoStock(stock: number, minimo: number): EstadoStock {
  if (stock <= 0) return "esgotado";
  return stock <= minimo ? "repor" : "em_stock";
}

/** Receita da loja sem IVA (linhas levantadas): Σ preço × quantidade ÷ (1 + taxa). */
export function receitaLojaSemIva(
  linhas: readonly { precoUnitarioCent: number; quantidade: number; ivaPercent: number }[],
): number {
  return linhas.reduce(
    (a, l) => a + precoSemIva(l.precoUnitarioCent * l.quantidade, l.ivaPercent),
    0,
  );
}
