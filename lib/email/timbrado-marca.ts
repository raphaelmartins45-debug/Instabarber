import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO } from "./enderecos";
import { type DadosTimbrado, emailTimbrado } from "./timbrado";

// O timbrado com a marca da InstaBarber (D-102): logótipo e ícones servidos do domínio principal,
// e no rodapé o endereço de quem responde. Usado pelas boas-vindas e pelos e-mails do contrato.

export function timbradoDaMarca(
  d: Omit<DadosTimbrado, "logoUrl" | "iconeEmailUrl" | "iconeInstagramUrl" | "rodape"> & {
    emailRodape: string;
  },
): string {
  const { emailRodape, ...resto } = d;
  const { texto: instagramTexto, url: instagramUrl } = textos.marca.instagram;
  return emailTimbrado({
    ...resto,
    logoUrl: `https://${DOMINIO}/marca/logo-horizontal-dourado.png`,
    iconeEmailUrl: `https://${DOMINIO}/marca/icone-email-dourado.png`,
    iconeInstagramUrl: `https://${DOMINIO}/marca/icone-instagram-dourado.png`,
    rodape: { email: emailRodape, instagramTexto, instagramUrl },
  });
}
