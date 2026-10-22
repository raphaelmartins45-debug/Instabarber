// Vista de apoio (E.1): o super_admin abre o painel de uma barbearia só para ler, durante 30
// minutos, com a sua própria sessão. O cookie só guarda a escolha; a leitura é do RLS (aal2).

export const COOKIE_APOIO = "ib_apoio";
export const DURACAO_APOIO_MIN = 30;

export type Apoio = { inquilino: string; expira: string };

/** O apoio em curso a partir do valor do cookie, ou nulo se não existir ou já tiver expirado. */
export function lerApoio(valor: string | undefined, agora: Date = new Date()): Apoio | null {
  if (!valor) return null;
  try {
    const a = JSON.parse(valor) as Partial<Apoio>;
    if (
      typeof a.inquilino !== "string" ||
      !/^[0-9a-f-]{36}$/.test(a.inquilino) ||
      typeof a.expira !== "string"
    )
      return null;
    return new Date(a.expira) > agora ? { inquilino: a.inquilino, expira: a.expira } : null;
  } catch {
    return null;
  }
}
