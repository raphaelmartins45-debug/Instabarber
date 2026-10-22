// A conta de autenticação do cliente é por barbearia (B.6): um e-mail técnico que o cliente
// nunca vê. Entra com o telemóvel e a palavra-passe; o servidor traduz para este e-mail.

export const DOMINIO_CONTAS_CLIENTE = "clientes.instabarber.pt";

/** `<telefone sem +>.<inquilino_id>@clientes.instabarber.pt` */
export function emailTecnicoCliente(telefoneE164: string, inquilinoId: string): string {
  const numero = telefoneE164.replace(/\D/g, "");
  if (!/^[1-9]\d{7,14}$/.test(numero)) throw new Error("Telefone inválido");
  if (!/^[0-9a-f-]{36}$/.test(inquilinoId)) throw new Error("Inquilino inválido");
  return `${numero}.${inquilinoId}@${DOMINIO_CONTAS_CLIENTE}`;
}

/** Contas de cliente nunca entram pela entrada da equipa. */
export function eContaCliente(email: string | undefined): boolean {
  return !!email && email.endsWith(`@${DOMINIO_CONTAS_CLIENTE}`);
}
