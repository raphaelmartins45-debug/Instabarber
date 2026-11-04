import "server-only";
import { origemDoPedido } from "@/lib/inquilino/endereco";
import { enderecosDaBarbearia } from "@/lib/inquilino/encaminhar";

/**
 * O endereço próprio da barbearia de demonstração (D-207): o subdomínio, para os painéis
 * abrirem com uma sessão à parte da de quem está a mostrar.
 */
export async function enderecoDemonstracao(slug: string): Promise<string> {
  return enderecosDaBarbearia({
    slug,
    dominioProprio: null,
    raiz: process.env.ROOT_DOMAIN || "instabarber.pt",
    origem: await origemDoPedido(),
  }).pagina;
}
