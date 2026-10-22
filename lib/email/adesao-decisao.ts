import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";

// E-mails da decisão sobre um pedido de adesão (D.8.2): boas-vindas na aprovação, com a
// ligação segura para definir a palavra-passe (B9), e resposta à rejeição, com o motivo.

const t = textos.admin.emails;

export function boasVindas(d: {
  para: string;
  responsavel: string;
  barbearia: string;
  paginaUrl: string;
  painelUrl: string;
  ligacaoPalavraPasse: string | null;
}): Email {
  const texto = [
    t.ola(d.responsavel),
    "",
    t.ativa(d.barbearia),
    "",
    ...(d.ligacaoPalavraPasse ? [t.definir, d.ligacaoPalavraPasse] : [t.jaTemConta]),
    "",
    t.pagina(d.paginaUrl),
    t.painel(d.painelUrl),
    "",
    t.equipa,
    "",
    t.imagensTitulo,
    ...t.imagens.map((linha) => `- ${linha}`),
    "",
    t.duvidas,
    "",
    t.despedida,
    textos.marca.assinatura,
  ].join("\n");
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: t.boasVindasAssunto(d.barbearia),
    texto,
    responderPara: `apoio@${DOMINIO}`,
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
