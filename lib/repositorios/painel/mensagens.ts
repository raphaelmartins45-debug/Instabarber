import type { ClienteBD } from "@/lib/supabase/tipos";

// Registo das ligações wa.me abertas (F.4.10): tentativa, nunca prova de envio.

export type TipoMensagem =
  | "lembrete"
  | "aniversario"
  | "recuperacao"
  | "posvenda"
  | "avaliacao"
  | "loja"
  | "cartao";

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
