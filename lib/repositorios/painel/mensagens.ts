import type { ClienteBD } from "@/lib/supabase/tipos";

// Registo das ligações wa.me abertas (F.4.10): tentativa, nunca prova de envio.

export type TipoMensagem =
  | "lembrete"
  | "aniversario"
  | "recuperacao"
  | "posvenda"
  | "avaliacao"
  | "loja"
  | "cartao"
  | "fila";

export async function registarMensagemAberta(
  bd: ClienteBD,
  m: {
    inquilinoId: string;
    clienteId: string | null;
    profissionalId: string | null;
    tipo: TipoMensagem;
    conteudo: string;
    referenciaId?: string | null;
    criadoPor: string;
  },
): Promise<boolean> {
  const { error } = await bd.from("mensagens").insert({
    inquilino_id: m.inquilinoId,
    cliente_id: m.clienteId,
    profissional_id: m.profissionalId,
    tipo: m.tipo,
    canal: "whatsapp",
    conteudo: m.conteudo,
    referencia_id: m.referenciaId ?? null,
    estado: "ligacao_aberta",
    aberta_em: new Date().toISOString(),
    criado_por: m.criadoPor,
  });
  return !error;
}

/** A última mensagem de um tipo por cliente (para a regra dos 90 dias da avaliação, F.4.13). */
export async function ultimaMensagemPorCliente(
  bd: ClienteBD,
  inquilinoId: string,
  clienteIds: string[],
  tipo: TipoMensagem,
): Promise<Map<string, string>> {
  if (clienteIds.length === 0) return new Map();
  const { data } = await bd
    .from("mensagens")
    .select("cliente_id, criado_em")
    .eq("inquilino_id", inquilinoId)
    .eq("tipo", tipo)
    .in("cliente_id", clienteIds)
    .order("criado_em", { ascending: false });
  const ultima = new Map<string, string>();
  for (const m of data ?? [])
    if (m.cliente_id && !ultima.has(m.cliente_id)) ultima.set(m.cliente_id, m.criado_em);
  return ultima;
}
