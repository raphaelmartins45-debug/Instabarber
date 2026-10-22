import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Outras receitas da barbearia no mês (F.4.11, bloco 7): mensalidades do clube recebidas e
// linhas da loja levantadas (o custo e o IVA ficam gravados na linha ao levantar).

export async function mensalidadesRecebidas(
  bd: ClienteBD,
  inquilinoId: string,
  intervalo: { de: Date; ate: Date },
): Promise<number> {
  const { data, error } = await bd
    .from("ciclos_clube")
    .select("valor")
    .eq("inquilino_id", inquilinoId)
    .gte("pago_em", intervalo.de.toISOString())
    .lt("pago_em", intervalo.ate.toISOString());
  if (error) falhaDeLeitura("ciclos_clube", error);
  return data.reduce((a, c) => a + centimosDeNumeric(c.valor), 0);
}

export type LinhaLevantada = {
  precoUnitarioCent: number;
  custoUnitarioCent: number;
  quantidade: number;
  ivaPercent: number;
};

export async function linhasLevantadas(
  bd: ClienteBD,
  inquilinoId: string,
  intervalo: { de: Date; ate: Date },
): Promise<LinhaLevantada[]> {
  const { data, error } = await bd
    .from("pedido_linhas")
    .select(
      "quantidade, preco_unitario, custo_unitario, iva_percent, pedidos_loja!inner(estado, levantado_em)",
    )
    .eq("inquilino_id", inquilinoId)
    .eq("pedidos_loja.estado", "levantado")
    .gte("pedidos_loja.levantado_em", intervalo.de.toISOString())
    .lt("pedidos_loja.levantado_em", intervalo.ate.toISOString());
  if (error) falhaDeLeitura("pedido_linhas", error);
  return data.map((l) => ({
    precoUnitarioCent: centimosDeNumeric(l.preco_unitario),
    custoUnitarioCent: centimosDeNumeric(l.custo_unitario),
    quantidade: l.quantidade,
    ivaPercent: Number(l.iva_percent),
  }));
}
