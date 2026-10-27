import "server-only";
import { headers } from "next/headers";
import { CABECALHO_BASE, CABECALHO_SLUG } from "./cabecalhos";
import { enderecoPublico } from "./encaminhar";

/** A barbearia do endereço onde se está e o prefixo das ligações públicas. */
export async function lerEndereco(): Promise<{ slug: string | null; base: string }> {
  const h = await headers();
  return { slug: h.get(CABECALHO_SLUG), base: h.get(CABECALHO_BASE) ?? "" };
}

/** Origem do pedido (protocolo e host), para as ligações dos e-mails de autenticação. */
export async function origemDoPedido(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const protocolo =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.includes(".localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

/** IP do cliente para os limites de pedidos (F.6). */
export async function ipDoPedido(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecido";
}

/** Endereço da página pública da barbearia, para as mensagens por wa.me. */
export async function paginaPublica(slug: string): Promise<string> {
  const origem = await origemDoPedido();
  return enderecoPublico(origem, await lerEndereco(), slug);
}

/**
 * Origem do domínio principal, para as ligações que só lá existem (Termos, Privacidade): vazia
 * quando já se está nele; no subdomínio ou no domínio próprio, o endereço completo.
 */
export async function origemPrincipal(): Promise<string> {
  const { slug, base } = await lerEndereco();
  if (!slug || base) return "";
  const raiz = process.env.ROOT_DOMAIN || "instabarber.pt";
  const origem = await origemDoPedido();
  const protocolo = origem.startsWith("http://") ? "http" : "https";
  const porta = /:(\d+)$/.exec(origem)?.[1];
  return `${protocolo}://${raiz}${porta && raiz === "localhost" ? `:${porta}` : ""}`;
}

/**
 * Onde a equipa volta a entrar (D-180): no endereço da barbearia, a página de cada papel
 * (/gestor ou /barbeiro); no domínio principal, a entrada geral.
 */
export async function entradaEquipaAqui(papel: "gestor" | "barbeiro" = "gestor"): Promise<string> {
  return (await lerEndereco()).slug ? `/${papel}` : "/entrar";
}
