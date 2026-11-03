import { type RegimeIva, TAXA_IVA } from "./mensalidade";

// Implementação contratada (D-189): paga-se uma só vez, junto com o primeiro pagamento da
// barbearia. O valor guarda-se sem IVA; no regime normal acresce o IVA, como na mensalidade.

export type ComImplementacao = {
  implementacao?: string | null;
  implementacao_sem_iva?: number | string | null;
  implementacao_paga_em?: string | null;
};

/** O valor da implementação com IVA, em cêntimos, se ainda estiver por pagar; senão 0. */
export function implementacaoPorPagarCent(b: ComImplementacao, regime: RegimeIva): number {
  if (!b.implementacao || b.implementacao === "nenhuma" || b.implementacao_paga_em) return 0;
  const semIva = Math.round(Number(b.implementacao_sem_iva ?? 0) * 100);
  return regime === "isento" ? semIva : Math.round(semIva * (1 + TAXA_IVA));
}
