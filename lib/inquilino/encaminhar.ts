import { CAMINHOS_RESERVADOS, type Host } from "./host";

// Decide para onde vai um pedido (L.4, passos 3 a 8). O middleware só encaminha:
// a autorização está no servidor e no RLS.

export type Zona = "publica" | "equipa" | "admin" | "cliente";

export type Decisao =
  | { acao: "nao_encontrado" }
  | {
      acao: "seguir";
      destino: string;
      /** Barbearia do endereço (subdomínio, domínio próprio ou /<slug>); nulo no domínio principal. */
      slug: string | null;
      /** Prefixo das ligações públicas: "" no endereço da barbearia, "/<slug>" no domínio principal. */
      base: string;
      zona: Zona;
    };

/** Slug do host já resolvido (o domínio próprio resolve-se antes, na base de dados). */
export type HostResolvido = { tipo: "principal" } | { tipo: "barbearia"; slug: string };

const reservado = (segmento: string) =>
  (CAMINHOS_RESERVADOS as readonly string[]).includes(segmento);
const comeca = (caminho: string, prefixo: string) =>
  caminho === prefixo || caminho.startsWith(`${prefixo}/`);
const eFicheiro = (caminho: string) => /\.[a-z0-9]+$/i.test(caminho);

function zonaDe(destino: string): Zona {
  if (comeca(destino, "/admin")) return "admin";
  if (comeca(destino, "/app")) return "equipa";
  if (/^\/b\/[^/]+\/minha-area(\/|$)/.test(destino)) return "cliente";
  return "publica";
}

function seguir(destino: string, slug: string | null, base: string): Decisao {
  return { acao: "seguir", destino, slug, base, zona: zonaDe(destino) };
}

export function encaminhar(host: HostResolvido, caminho: string): Decisao {
  // A rota interna /b/ nunca se vê de fora.
  if (comeca(caminho, "/b")) return { acao: "nao_encontrado" };

  if (host.tipo === "principal") {
    const [, primeiro = "", ...resto] = caminho.split("/");
    if (primeiro === "" || reservado(primeiro) || eFicheiro(caminho))
      return seguir(caminho, null, "");
    const restante = resto.length ? `/${resto.join("/")}` : "";
    return seguir(`/b/${primeiro}${restante}`, primeiro, `/${primeiro}`);
  }

  const { slug } = host;
  // O InstaBarber Admin só existe no domínio principal: 404, nunca redireciona (L.4, passo 8).
  if (comeca(caminho, "/admin")) return { acao: "nao_encontrado" };
  // No endereço da barbearia, /entrar é do cliente; a equipa entra em /app/entrar.
  if (comeca(caminho, "/app/entrar")) return seguir(caminho.slice("/app".length), slug, "");
  if (comeca(caminho, "/app") || comeca(caminho, "/api") || eFicheiro(caminho)) {
    return seguir(caminho, slug, "");
  }
  return seguir(`/b/${slug}${caminho === "/" ? "" : caminho}`, slug, "");
}

/** Converte o host classificado no que o encaminhamento precisa. */
export function hostResolvido(host: Host, slugDoDominio: string | null): HostResolvido {
  if (host.tipo === "principal") return { tipo: "principal" };
  if (host.tipo === "subdominio") return { tipo: "barbearia", slug: host.slug };
  // Domínio próprio desconhecido: «_» não é um slug válido e dá «Barbearia não encontrada».
  return { tipo: "barbearia", slug: slugDoDominio ?? "_" };
}

/** Caminho da entrada da equipa, conforme o endereço. */
export function caminhoEntradaEquipa(host: HostResolvido): string {
  return host.tipo === "principal" ? "/entrar" : "/app/entrar";
}

/** Aceita só caminhos relativos do próprio site (evita redirecionamentos para fora). */
export function caminhoSeguro(texto: string | null | undefined, alternativa: string): string {
  if (!texto || !texto.startsWith("/") || texto.startsWith("//") || texto.includes("\\")) {
    return alternativa;
  }
  return texto;
}
