import type { ClienteBD } from "@/lib/supabase/tipos";

// Limites de pedidos nas entradas públicas (F.6), contados na base de dados por
// consumir_limite(). Só a chave de serviço a executa.

export const LIMITES = {
  pedirCodigoIp: { maximo: 10, janelaSegundos: 3600 },
  criarAcessoIp: { maximo: 20, janelaSegundos: 3600 },
  entrarClienteIp: { maximo: 30, janelaSegundos: 3600 },
  // Adesão (F.6): 3 por hora por IP e por e-mail; os carregamentos de imagens à parte.
  adesaoIp: { maximo: 3, janelaSegundos: 3600 },
  adesaoEmail: { maximo: 3, janelaSegundos: 3600 },
  carregamentoIp: { maximo: 40, janelaSegundos: 3600 },
} as const;

/** Verdadeiro se o pedido pode seguir. */
export async function consumirLimite(
  bdServico: ClienteBD,
  chave: string,
  limite: { maximo: number; janelaSegundos: number },
): Promise<boolean> {
  const { data, error } = await bdServico.rpc("consumir_limite", {
    p_chave: chave,
    p_max: limite.maximo,
    p_janela: `${limite.janelaSegundos} seconds`,
  });
  if (error) throw new Error(`Limite de pedidos falhou: ${error.message}`);
  return data === true;
}

/** Marcação pública (F.6): reservas e confirmações por IP. */
export const LIMITES_MARCACAO = {
  reservarIp: { maximo: 30, janelaSegundos: 3600 },
  confirmarIp: { maximo: 15, janelaSegundos: 3600 },
  /** Entradas nas filas e encomendas da loja (F.4.1, F.4.3, F.4.4). */
  entradaIp: { maximo: 20, janelaSegundos: 3600 },
} as const;
