import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import { timbradoDaMarca } from "./timbrado-marca";

// E-mails da decisão sobre um pedido de adesão (D.8.2): boas-vindas na aprovação, com a
// ligação segura para definir a palavra-passe (B9) e o guia de arranque personalizado em anexo
// (D-181), e resposta à rejeição, com o motivo.

const t = textos.admin.emails;

export type Anexo = { nome: string; conteudo: Buffer };

export function boasVindas(d: {
  para: string;
  responsavel: string;
  barbearia: string;
  paginaUrl: string;
  painelUrl: string;
  ligacaoPalavraPasse: string | null;
  guia?: Anexo | null;
}): Email {
  const acesso = d.ligacaoPalavraPasse ? [t.definir, d.ligacaoPalavraPasse] : [t.jaTemConta];
  const enderecosTexto = [t.pagina(d.paginaUrl), t.painel(d.painelUrl)];
  const guia = d.guia ? [t.guiaAnexo(d.barbearia)] : [];
  const imagens = [t.imagensTitulo, ...t.imagens.map((linha) => `- ${linha}`)];
  const texto = [
    t.ola(d.responsavel),
    "",
    t.ativa(d.barbearia),
    "",
    ...acesso,
    "",
    ...enderecosTexto,
    "",
    ...guia.flatMap((g) => [g, ""]),
    t.equipa,
    "",
    ...imagens,
    "",
    t.duvidas,
    "",
    t.despedida,
    textos.marca.assinatura,
  ].join("\n");
  const html = timbradoDaMarca({
    saudacao: t.ola(d.responsavel),
    paragrafos: [t.ativa(d.barbearia), ...acesso, ...enderecosTexto, ...guia, t.equipa],
    paragrafosFinais: [...imagens, t.duvidas],
    despedida: t.despedida,
    assinatura: [textos.marca.assinatura],
    emailRodape: `apoio@${DOMINIO}`,
  });
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: t.boasVindasAssunto(d.barbearia),
    texto,
    html,
    responderPara: `apoio@${DOMINIO}`,
    ...(d.guia ? { anexos: [{ nome: d.guia.nome, conteudo: d.guia.conteudo }] } : {}),
  };
}

/** O guia de arranque outra vez, pedido no Gerador de documentos (D-181). */
export function envioGuia(d: {
  para: string;
  responsavel: string;
  barbearia: string;
  guia: Anexo;
}): Email {
  const corpo = [t.guiaReenvio(d.barbearia), t.duvidas];
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: t.guiaAssunto(d.barbearia),
    texto: [
      t.ola(d.responsavel),
      "",
      ...corpo.flatMap((p) => [p, ""]),
      t.despedida,
      textos.marca.assinatura,
    ].join("\n"),
    html: timbradoDaMarca({
      saudacao: t.ola(d.responsavel),
      paragrafos: corpo,
      paragrafosFinais: [],
      despedida: t.despedida,
      assinatura: [textos.marca.assinatura],
      emailRodape: `apoio@${DOMINIO}`,
    }),
    responderPara: `apoio@${DOMINIO}`,
    anexos: [{ nome: d.guia.nome, conteudo: d.guia.conteudo }],
  };
}

export function respostaRejeicao(d: {
  para: string;
  responsavel: string;
  barbearia: string;
  motivo: string;
}): Email {
  const texto = [
    t.ola(d.responsavel),
    "",
    t.rejeicao(d.barbearia),
    t.motivo(d.motivo),
    "",
    t.rejeicaoContacto,
    "",
    t.despedida,
    textos.marca.assinatura,
  ].join("\n");
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: t.rejeicaoAssunto(d.barbearia),
    texto,
    responderPara: `comercial@${DOMINIO}`,
  };
}
