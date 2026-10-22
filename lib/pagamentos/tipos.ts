// Módulo de pagamentos (G.4): preparado e desligado (D-01, D-02, D-126). Não é código morto: está
// atrás de um interruptor, testado, e só o super_admin o liga (CLAUDE.md, regra 13).

export type Finalidade = "sinal" | "clube" | "mensalidade";
export type EstadoPagamento = "pendente" | "pago" | "falhou" | "expirado" | "reembolsado";

export type PedidoPagamento = {
  finalidade: Finalidade;
  referenciaId: string;
  valorCent: number;
  telefone: string;
};

export type EventoPagamento = { idExterno: string; estado: EstadoPagamento };

/** O que cada fornecedor tem de saber fazer (ifthenpay, Eupago ou Stripe; D-05). */
export interface AdaptadorPagamentos {
  readonly fornecedor: string;
  pedir(p: PedidoPagamento): Promise<{ idExterno: string; estado: EstadoPagamento }>;
  consultar(idExterno: string): Promise<EstadoPagamento>;
  /** Nulo se a assinatura não confere: o webhook recusa. */
  lerWebhook(corpo: string, assinatura: string | null): EventoPagamento | null;
  reembolsar(idExterno: string): Promise<EstadoPagamento>;
}
