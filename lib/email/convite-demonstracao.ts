import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { assinaturaComercial } from "./contacto";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import { emailDaMarca } from "./timbrado-marca";

// O convite da demonstração (D-209): segue para o e-mail do lead quando o comercial gera a
// demonstração, com a ligação instabarber.pt/demo e o código de acesso da reunião. Assina
// «Comercial InstaBarber» com o WhatsApp (D-101).

const t = textos.comercial.demonstracao.convite;
const COMERCIAL = `comercial@${DOMINIO}`;

export function conviteDemonstracao(d: {
  para: string;
  nome: string;
  barbearia: string;
  ligacao: string;
  codigo: string;
}): Email {
  return {
    de: enderecos.comercialRemetente(),
    para: d.para,
    assunto: t.assunto(d.barbearia),
    ...emailDaMarca(
      {
        saudacao: t.ola(d.nome),
        corpo: [
          ...t.corpo(d.barbearia),
          { destaque: d.codigo, nota: t.codigoNota },
          { botao: t.botao, url: d.ligacao, nota: t.nota },
        ],
        despedida: t.despedida,
        assinatura: assinaturaComercial(),
      },
      COMERCIAL,
    ),
    responderPara: COMERCIAL,
  };
}
