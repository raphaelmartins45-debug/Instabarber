import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { assinaturaComercial } from "./contacto";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import { timbradoDaMarca } from "./timbrado-marca";

// E-mails do contrato enviado ao cliente (D-181): o contrato em anexo com a ligação para o
// carregar assinado; o aviso à equipa quando chega; o agradecimento com a ligação da adesão; e
// a recusa com o motivo. Assinam «Comercial InstaBarber» com o WhatsApp (D-101).

const t = textos.contratoCliente.emails;
const COMERCIAL = `comercial@${DOMINIO}`;

function montar(d: {
  para: string;
  assunto: string;
  nome: string;
  paragrafos: string[];
  destaque?: { titulo: string; nota?: string };
  finais: string[];
  anexos?: Email["anexos"];
}): Email {
  const assinatura = assinaturaComercial();
  const texto = [
    t.ola(d.nome),
    "",
    ...d.paragrafos.flatMap((p) => [p, ""]),
    ...(d.destaque ? [d.destaque.titulo, ...(d.destaque.nota ? [d.destaque.nota] : []), ""] : []),
    ...d.finais.flatMap((p) => [p, ""]),
    t.despedida,
    "",
    ...assinatura,
  ].join("\n");
  return {
    de: enderecos.comercialRemetente(),
    para: d.para,
    assunto: d.assunto,
    texto,
    html: timbradoDaMarca({
      saudacao: t.ola(d.nome),
      paragrafos: d.paragrafos,
      ...(d.destaque ? { destaque: d.destaque } : {}),
      paragrafosFinais: d.finais,
      despedida: t.despedida,
      assinatura,
      emailRodape: COMERCIAL,
    }),
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
    paragrafos: [...t.envio(d.numero), t.passosTitulo, ...t.passos],
    destaque: { titulo: d.ligacao, nota: t.ligacaoNota },
    finais: [t.depois],
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
    paragrafos: [...t.obrigado(d.numero)],
    destaque: { titulo: d.ligacaoAdesao, nota: t.adesaoNota },
    finais: [t.obrigadoDepois],
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
    paragrafos: [...t.recusa(d.numero, d.motivo)],
    destaque: { titulo: d.ligacao, nota: t.ligacaoNota },
    finais: [],
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
