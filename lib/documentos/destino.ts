// Para onde vai o guia de arranque reenviado (D-193): o e-mail da ficha da barbearia, como os
// e-mails dos pagamentos; sem ele, o da conta do proprietário.

export function destinoDoGuia(
  emailBarbearia: string | null | undefined,
  emailDono: string | null | undefined,
): string | null {
  return emailBarbearia?.trim() || emailDono?.trim() || null;
}
