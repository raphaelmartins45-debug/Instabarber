import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// O que a ficha do cliente mostra além dos dados (E.2): selos, clube, loja e faltas. A ficha
// técnica (histórico de cortes) está em `historico-cortes.ts`.
// O RLS decide o que o barbeiro vê (só os seus clientes).

export type MovimentoSelos = { id: string; tipo: string; quantidade: number; criadoEm: string };

export async function listarMovimentosSelos(
  bd: ClienteBD,
  clienteId: string,
): Promise<MovimentoSelos[]> {
  const { data, error } = await bd
    .from("movimentos_selos")
    .select("id, tipo, quantidade, criado_em")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("movimentos_selos", error);
  return data.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    quantidade: m.quantidade,
    criadoEm: m.criado_em,
  }));
}

export type SubscricaoCliente = {
  id: string;
  clube: string;
  estado: string;
  proximaRenovacao: string;
};

export async function listarSubscricoesCliente(
  bd: ClienteBD,
  clienteId: string,
): Promise<SubscricaoCliente[]> {
  const { data, error } = await bd
    .from("subscricoes")
    .select("id, estado, proxima_renovacao, clubes(nome)")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("subscricoes", error);
  return data.map((s) => ({
    id: s.id,
    clube: s.clubes?.nome ?? "",
    estado: s.estado,
    proximaRenovacao: s.proxima_renovacao,
  }));
}

export type PedidoCliente = {
  id: string;
  numero: number;
  estado: string;
  totalCent: number;
  criadoEm: string;
};

export async function listarPedidosCliente(
  bd: ClienteBD,
  clienteId: string,
): Promise<PedidoCliente[]> {
  const { data, error } = await bd
    .from("pedidos_loja")
    .select("id, numero, estado, total, criado_em")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });
  if (error) falhaDeLeitura("pedidos_loja", error);
  return data.map((p) => ({
    id: p.id,
    numero: p.numero,
    estado: p.estado,
    totalCent: centimosDeNumeric(p.total),
    criadoEm: p.criado_em,
  }));
}

/** Faltas do cliente (as mais recentes primeiro). */
export async function listarFaltas(bd: ClienteBD, clienteId: string): Promise<string[]> {
  const { data, error } = await bd
    .from("marcacoes")
    .select("inicio")
    .eq("cliente_id", clienteId)
    .eq("estado", "falta")
    .order("inicio", { ascending: false });
  if (error) falhaDeLeitura("marcacoes", error);
  return data.map((m) => m.inicio);
}
