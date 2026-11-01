import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { assinaturaComercial } from "./contacto";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import type { BlocoEmail } from "./timbrado";
import { emailDaMarca } from "./timbrado-marca";

// E-mails do contrato enviado ao cliente (D-181): o contrato em anexo com o botão para o
// carregar assinado; o aviso à equipa quando chega; o agradecimento com o botão da adesão; e
// a recusa com o motivo. Assinam «Comercial InstaBarber» com o WhatsApp (D-101).

const t = textos.contratoCliente.emails;
const COMERCIAL = `comercial@${DOMINIO}`;

function montar(d: {
  para: string;
  assunto: string;
  nome: string;
  corpo: BlocoEmail[];
  anexos?: Email["anexos"];
}): Email {
  return {
    de: enderecos.comercialRemetente(),
    para: d.para,
    assunto: d.assunto,
    ...emailDaMarca(
      {
        saudacao: t.ola(d.nome),
        corpo: d.corpo,
        despedida: t.despedida,
        assinatura: assinaturaComercial(),
      },
      COMERCIAL,
    ),
    responderPara: COMERCIAL,
    ...(d.anexos ? { anexos: d.anexos } : {}),
  };
}

export function envioContrato(d: {
  para: string;
  nome: string;
  numero: string;
  ligacao: string;
  pdf: { nome: string; conteudo: Buffer };
}): Email {
  return montar({
    para: d.para,
    assunto: t.envioAssunto(d.numero),
    nome: d.nome,
    corpo: [
      ...t.envio(d.numero),
      { titulo: t.passosTitulo },
      { lista: t.passos, numerada: true },
      { botao: t.carregarBotao, url: d.ligacao, nota: t.ligacaoNota },
      t.depois,
    ],
    anexos: [d.pdf],
  });
}

export function agradecimentoContrato(d: {
  para: string;
  nome: string;
  numero: string;
  ligacaoAdesao: string;
}): Email {
  return montar({
    para: d.para,
    assunto: t.obrigadoAssunto(d.numero),
    nome: d.nome,
    corpo: [
      ...t.obrigado(d.numero),
      { botao: t.adesaoBotao, url: d.ligacaoAdesao, nota: t.adesaoNota },
      t.obrigadoDepois,
    ],
  });
}

export function recusaContrato(d: {
  para: string;
  nome: string;
  numero: string;
  motivo: string;
  ligacao: string;
}): Email {
  return montar({
    para: d.para,
    assunto: t.recusaAssunto(d.numero),
    nome: d.nome,
    corpo: [
      t.recusa(d.numero),
      { destaque: d.motivo },
      t.recusaDepois,
      { botao: t.corrigidoBotao, url: d.ligacao, nota: t.ligacaoNota },
    ],
  });
}

/** Aviso interno: o cliente carregou o contrato assinado; confira na ficha do lead. */
export function avisoContratoCarregado(d: { numero: string; nome: string; ficha: string }): Email {
  return {
    de: enderecos.remetente(),
    para: enderecos.comercial(),
    assunto: t.avisoAssunto(d.numero, d.nome),
    texto: [t.aviso(d.numero, d.nome), d.ficha, "", textos.marca.assinatura].join("\n"),
  };
}
