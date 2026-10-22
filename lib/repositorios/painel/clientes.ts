import type { ClienteBD } from "@/lib/supabase/tipos";
import type { Database } from "@/types/database";
import { falhaDeLeitura } from "../erros";

// Clientes da barbearia. O RLS mostra ao barbeiro só os seus (os que marcou ou atendeu e os
// que registou); o gestor vê todos. Sem DELETE: o direito de eliminação é anonimizar_cliente().

export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];

export async function procurarPorTelefone(
  bd: ClienteBD,
  inquilinoId: string,
  telefone: string,
): Promise<{ id: string; nome: string } | null> {
  const { data, error } = await bd.rpc("procurar_cliente_por_telefone", {
    p_inquilino: inquilinoId,
    p_telefone: telefone,
  });
  if (error) falhaDeLeitura("procurar_cliente_por_telefone", error);
  return data[0] ?? null;
}

/** Cliente registado ao balcão (origem «balcao»), com o consentimento e a data, se o deu. */
export async function criarClienteBalcao(
  bd: ClienteBD,
  d: { inquilinoId: string; nome: string; telefone: string; consentimento: boolean },
): Promise<string | null> {
  const { data, error } = await bd
    .from("clientes")
    .insert({
      inquilino_id: d.inquilinoId,
      nome: d.nome,
      telefone: d.telefone,
      origem: "balcao",
      consentimento_mensagens: d.consentimento,
      consentimento_em: d.consentimento ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  return error ? null : data.id;
}

export async function listarClientes(bd: ClienteBD, inquilinoId: string): Promise<Cliente[]> {
  const { data, error } = await bd
    .from("clientes")
    .select("*")
    .eq("inquilino_id", inquilinoId)
    .order("nome");
  if (error) falhaDeLeitura("clientes", error);
  return data;
}

export async function obterCliente(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<Cliente | null> {
  const { data, error } = await bd
    .from("clientes")
    .select("*")
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .maybeSingle();
  if (error) falhaDeLeitura("clientes", error);
  return data;
}

export async function alterarCliente(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
  alteracao: Database["public"]["Tables"]["clientes"]["Update"],
): Promise<boolean> {
  const { data, error } = await bd
    .from("clientes")
    .update(alteracao)
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("id");
  return !error && data.length > 0;
}

/** Saldo de selos de um cliente (vista saldo_selos). */
export async function saldoSelos(bd: ClienteBD, clienteId: string): Promise<number> {
  const { data, error } = await bd
    .from("saldo_selos")
    .select("selos")
    .eq("cliente_id", clienteId)
    .maybeSingle();
  if (error) falhaDeLeitura("saldo_selos", error);
  return data?.selos ?? 0;
}

/** Saldos de selos de todos os clientes da barbearia. */
export async function saldosSelos(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<Map<string, number>> {
  const { data, error } = await bd
    .from("saldo_selos")
    .select("cliente_id, selos")
    .eq("inquilino_id", inquilinoId);
  if (error) falhaDeLeitura("saldo_selos", error);
  return new Map(data.flatMap((s) => (s.cliente_id ? [[s.cliente_id, s.selos ?? 0]] : [])));
}

/** Há crédito do clube pago, válido hoje, para este serviço? (concluir_marcacao volta a verificar.) */
export async function temCreditoClube(
  bd: ClienteBD,
  clienteId: string,
  servicoId: string,
  hoje: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("creditos_clube")
    .select(
      "quantidade, usados, ciclos_clube!inner(inicio, fim, pago_em, subscricoes!inner(cliente_id))",
    )
    .eq("servico_id", servicoId)
    .eq("ciclos_clube.subscricoes.cliente_id", clienteId)
    .not("ciclos_clube.pago_em", "is", null)
    .lte("ciclos_clube.inicio", hoje)
    .gt("ciclos_clube.fim", hoje);
  if (error) falhaDeLeitura("creditos_clube", error);
  return data.some((c) => c.usados < c.quantidade);
}
