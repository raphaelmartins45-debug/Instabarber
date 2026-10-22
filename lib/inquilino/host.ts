// Classificação do host do pedido (L.4). Funções puras: o middleware usa-as e os testes também.

/** Os mesmos nomes que a base de dados recusa como slug (`inquilinos.slug`, 01_tabelas.sql). */
export const CAMINHOS_RESERVADOS = [
  "admin",
  "app",
  "api",
  "b",
  "www",
  "apoio",
  "ajuda",
  "entrar",
  "login",
  "registo",
  "adesao",
  "termos",
  "privacidade",
  "static",
  "_next",
  "instabarber",
  "performa",
  "performalab",
  "conta",
  "minha-area",
] as const;

export const FORMATO_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugValido(texto: string): boolean {
  return (
    texto.length >= 3 &&
    texto.length <= 40 &&
    FORMATO_SLUG.test(texto) &&
    !(CAMINHOS_RESERVADOS as readonly string[]).includes(texto)
  );
}

export type Host =
  | { tipo: "principal" }
  | { tipo: "subdominio"; slug: string }
  | { tipo: "dominio"; dominio: string };

/**
 * Domínio principal: o domínio raiz, o www e as pré-visualizações da Vercel.
 * `<slug>.<raiz>` é uma barbearia; qualquer outro host é um domínio próprio.
 */
export function classificarHost(cabecalhoHost: string, dominioRaiz: string): Host {
  const host = cabecalhoHost.toLowerCase().replace(/:\d+$/, "");
  const raiz = dominioRaiz.toLowerCase();
  if (host === raiz || host === `www.${raiz}` || host.endsWith(".vercel.app")) {
    return { tipo: "principal" };
  }
  if (host.endsWith(`.${raiz}`)) {
    // Um subdomínio inválido (reservado, mal formado) continua a ser de barbearia:
    // dá «Barbearia não encontrada», nunca o domínio principal (admin.<raiz> não abre o /admin).
    return { tipo: "subdominio", slug: host.slice(0, -(raiz.length + 1)) };
  }
  return { tipo: "dominio", dominio: host };
}
