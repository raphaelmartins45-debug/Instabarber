import "server-only";
import { variavel } from "@/lib/configuracao/ambiente";
import { textos } from "@/lib/i18n/pt-PT";

// Endereços de correio (L.2). O endereço segue a natureza da mensagem, não quem escreve.
// O comercial@ e o remetente técnico vêm do ambiente; os alias fixos do domínio da marca vivem aqui.

const DOMINIO = "instabarber.pt";

export const enderecos = {
  /** Destino dos avisos de pedidos de contacto da landing. */
  comercial: () => variavel("EMAIL_COMERCIAL"),
  /** Remetente técnico dos e-mails transacionais (Resend). */
  remetente: () => `${textos.marca.nome} <${variavel("EMAIL_REMETENTE")}>`,
  /** Remetente das respostas ao visitante e do apoio às barbearias. */
  apoio: () => `${textos.marca.nome} <apoio@${DOMINIO}>`,
};
