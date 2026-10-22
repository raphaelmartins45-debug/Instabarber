// As chaves do fornecedor colam-se uma vez no painel da Vercel (G.4, L.2). Sem elas, o
// interruptor geral não liga e o painel diz quais faltam.

export const CHAVES_MODULO = {
  pagamentos: ["PAGAMENTOS_FORNECEDOR", "PAGAMENTOS_CHAVE", "PAGAMENTOS_SEGREDO_WEBHOOK"],
  faturacao: ["FATURACAO_FORNECEDOR", "FATURACAO_CHAVE"],
} as const;

export type ChaveModulo = keyof typeof CHAVES_MODULO;

export function chavesEmFalta(
  modulo: ChaveModulo,
  ambiente: Record<string, string | undefined> = process.env,
): string[] {
  return CHAVES_MODULO[modulo].filter((k) => !ambiente[k]?.trim());
}
