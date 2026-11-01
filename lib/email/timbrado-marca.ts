import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO } from "./enderecos";
import { type CorpoEmail, emailTimbrado, textoDoEmail } from "./timbrado";

// O timbrado com a marca da InstaBarber (D-102): logótipo e ícones servidos do domínio
// principal, e no rodapé o endereço de quem responde. Devolve o HTML e o texto simples dos mesmos
// blocos (D-184), para todos os e-mails da InstaBarber para fora.

export function emailDaMarca(
  d: CorpoEmail,
  emailRodape: string,
  rodapeTexto?: string,
): { html: string; texto: string } {
  const { texto: instagramTexto, url: instagramUrl } = textos.marca.instagram;
  return {
    html: emailTimbrado({
      ...d,
      logoUrl: `https://${DOMINIO}/marca/logo-horizontal-dourado.png`,
      iconeEmailUrl: `https://${DOMINIO}/marca/icone-email-dourado.png`,
      iconeInstagramUrl: `https://${DOMINIO}/marca/icone-instagram-dourado.png`,
      rodape: { email: emailRodape, instagramTexto, instagramUrl },
    }),
    texto: textoDoEmail(d, rodapeTexto),
  };
}
