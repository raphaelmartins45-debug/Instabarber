import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";

// Comissões dos comerciais (D-162): a taxa de migração do contrato fechado. Pendente até a
// barbearia pagar a taxa; a pagar nos 10 dias seguintes; vencida depois disso; paga.

export type Comissao = {
  id: string;
  estado: string;
  valor: number | string;
  vence_em: string | null;
};
export type EstadoComissao = "pendente" | "a_pagar" | "vencida" | "paga";

export function estadoComissao(c: Comissao, hoje: string): EstadoComissao {
  if (c.estado === "paga") return "paga";
  if (c.estado === "a_pagar") return c.vence_em && c.vence_em < hoje ? "vencida" : "a_pagar";
  return "pendente";
}

/** Totais em cêntimos por estado, e quantas estão vencidas. */
export function resumoComissoes(comissoes: Comissao[], hoje: string) {
  const r = { pendente: 0, a_pagar: 0, vencida: 0, paga: 0, vencidas: 0 };
  for (const c of comissoes) {
    const e = estadoComissao(c, hoje);
    r[e] += centimosDeNumeric(c.valor);
    if (e === "vencida") r.vencidas += 1;
  }
  return r;
}
