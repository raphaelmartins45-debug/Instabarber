// Ligações wa.me (regra 7): o sistema prepara a mensagem e abre a conversa; o envio
// confirma-se à mão. Nenhum envio automático.

/** `https://wa.me/<número sem +>?text=<mensagem>` a partir de um telefone em E.164. */
export function ligacaoWhatsApp(telefoneE164: string, mensagem: string): string {
  const numero = telefoneE164.replace(/\D/g, "");
  if (!/^[1-9]\d{7,14}$/.test(numero)) throw new Error("Telefone inválido para wa.me");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
