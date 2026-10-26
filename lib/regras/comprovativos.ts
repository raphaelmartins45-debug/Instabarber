// Comprovativos de pagamento da mensalidade (D-168): o que se aceita e o estado de cada fatura.
// A autoridade é a base de dados (enviar_comprovativo); isto só decide o que se mostra e evita
// carregar ficheiros que ela recusaria.

export const COMPROVATIVO = {
  tipos: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf",
  } as Record<string, string>,
  maxBytes: 5 * 1024 * 1024,
};

/** A extensão com que o ficheiro se guarda, ou nulo se o tipo ou o tamanho não servirem. */
export function extensaoComprovativo(ficheiro: { type: string; size: number }): string | null {
  const extensao = COMPROVATIVO.tipos[ficheiro.type];
  return extensao && ficheiro.size > 0 && ficheiro.size <= COMPROVATIVO.maxBytes ? extensao : null;
}

export type EstadoFatura = "paga" | "emAnalise" | "porPagar";

/** Paga quando tem data; em análise quando há um comprovativo pendente para ela; senão, por pagar. */
export function estadoFatura(
  f: { id: string; paga_em: string | null },
  emAnalise: ReadonlySet<string>,
): EstadoFatura {
  if (f.paga_em) return "paga";
  return emAnalise.has(f.id) ? "emAnalise" : "porPagar";
}
