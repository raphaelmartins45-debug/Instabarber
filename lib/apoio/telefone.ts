import { formatarTelefone, telefoneE164 } from "@/lib/formatacao/telefone";

// O telefone do apoio nas páginas de erro (D-197): o do Apoio ao cliente se existir, senão o
// comercial. Vem só da configuração (TELEFONE_APOIO_TXT, TELEFONE_COMERCIAL_TXT, TELEFONE_COMERCIAL).

export type TelefoneApoio = { e164: string; texto: string };

/** O primeiro telefone válido, por ordem de preferência; nulo se nenhum servir. */
export function escolherTelefoneApoio(
  ...candidatos: (string | undefined | null)[]
): TelefoneApoio | null {
  for (const c of candidatos) {
    const e164 = c?.trim() ? telefoneE164(c) : null;
    if (e164) return { e164, texto: formatarTelefone(e164) };
  }
  return null;
}
