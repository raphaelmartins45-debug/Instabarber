import { telefoneE164 } from "@/lib/formatacao/telefone";

// Ligações wa.me (regra 7): o sistema prepara a mensagem e abre a conversa; o envio
// confirma-se à mão. Nenhum envio automático.

/** `https://wa.me/<número sem +>?text=<mensagem>` a partir de um telefone em E.164. */
export function ligacaoWhatsApp(telefoneE164: string, mensagem: string): string {
  const numero = telefoneE164.replace(/\D/g, "");
  if (!/^[1-9]\d{7,14}$/.test(numero)) throw new Error("Telefone inválido para wa.me");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * A ligação wa.me para um telefone guardado como o lead o escreveu («912 345 678»,
 * «+351912345678»…). Números portugueses ganham o indicativo; inválidos dão nulo.
 */
export function ligacaoParaTelefone(telefone: string | null, mensagem: string): string | null {
  if (!telefone) return null;
  const e164 = telefoneE164(telefone) ?? (telefone.trim().startsWith("+") ? telefone : null);
  try {
    return e164 ? ligacaoWhatsApp(e164, mensagem) : null;
  } catch {
    return null;
  }
}

/** `https://wa.me/?text=…` sem número: o WhatsApp abre e a pessoa escolhe o contacto. */
export function ligacaoSemNumero(mensagem: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
}
