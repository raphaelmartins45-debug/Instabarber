import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { assinaturaComercial } from "./contacto";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import type { BlocoEmail } from "./timbrado";
import { emailDaMarca } from "./timbrado-marca";

// Os e-mails da demonstração ao lead (D-209, D-211): a confirmação quando o comercial a marca, e
// o lembrete no dia, quando gera a demonstração, com a hora, a ligação, o código e como entrar.
// Assinam «Comercial InstaBarber» com o WhatsApp (D-101).

const COMERCIAL = `comercial@${DOMINIO}`;

function montar(d: {
  para: string;
  assunto: string;
  saudacao: string;
  corpo: BlocoEmail[];
  despedida: string;
}): Email {
  return {
    de: enderecos.comercialRemetente(),
    para: d.para,
    assunto: d.assunto,
    ...emailDaMarca(
      {
        saudacao: d.saudacao,
        corpo: d.corpo,
        despedida: d.despedida,
        assinatura: assinaturaComercial(),
      },
      COMERCIAL,
    ),
    responderPara: COMERCIAL,
  };
}

/** A confirmação da demonstração marcada, com o dia e a hora. */
export function confirmacaoDemonstracao(d: { para: string; nome: string; quando: string }): Email {
  const t = textos.comercial.marcarDemo.email;
  return montar({
    para: d.para,
    assunto: t.assunto,
    saudacao: t.ola(d.nome),
    corpo: [...t.corpo(d.quando), { destaque: d.quando, nota: t.quando }],
    despedida: t.despedida,
  });
}

/** O lembrete do dia: a hora, como entrar, o código e a ligação da demonstração. */
export function conviteDemonstracao(d: {
  para: string;
  nome: string;
  barbearia: string;
  quando: string;
  ligacao: string;
  codigo: string;
}): Email {
  const t = textos.comercial.demonstracao.convite;
  return montar({
    para: d.para,
    assunto: t.assunto(d.quando),
    saudacao: t.ola(d.nome),
    corpo: [
      ...t.corpo(d.barbearia, d.quando),
      { titulo: t.comoTitulo },
      { lista: t.como, numerada: true },
      { destaque: d.codigo, nota: t.codigoNota },
      { botao: t.botao, url: d.ligacao, nota: t.nota },
    ],
    despedida: t.despedida,
  });
}
