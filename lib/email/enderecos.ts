import "server-only";
import { variavel } from "@/lib/configuracao/ambiente";
import { textos } from "@/lib/i18n/pt-PT";

// Endereços de correio (L.2). O endereço segue a natureza da mensagem, não quem escreve.
// O comercial@ e o remetente técnico vêm do ambiente; os alias fixos do domínio da marca vivem aqui.

export const DOMINIO = "instabarber.pt";

export const enderecos = {
  /** Destino dos avisos de pedidos de contacto da landing. */
  comercial: () => variavel("EMAIL_COMERCIAL"),
  /** Onde chegam as adesões (L.2). */
  notificacoes: () => variavel("EMAIL_NOTIFICACOES"),
  /** Remetente técnico dos e-mails transacionais (Resend). */
  remetente: () => `${textos.marca.nome} <${variavel("EMAIL_REMETENTE")}>`,
  /** Remetente das respostas ao visitante e do apoio às barbearias. */
  apoio: () => `${textos.marca.nome} <apoio@${DOMINIO}>`,
};
