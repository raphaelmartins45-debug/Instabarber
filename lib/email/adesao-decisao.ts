import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import type { BlocoEmail, CorpoEmail } from "./timbrado";
import { emailDaMarca } from "./timbrado-marca";

// E-mails da decisão sobre um pedido de adesão (D.8.2): boas-vindas na aprovação, com a
// ligação segura para definir a palavra-passe (B9) e o guia de arranque personalizado em anexo
// (D-181), e resposta à rejeição, com o motivo. Do apoio@, timbrados (D-184).

const t = textos.admin.emails;
const APOIO = `apoio@${DOMINIO}`;

export type Anexo = { nome: string; conteudo: Buffer };

const corpo = (nome: string, blocos: BlocoEmail[]): CorpoEmail => ({
  saudacao: t.ola(nome),
  corpo: blocos,
  despedida: t.despedida,
  assinatura: [textos.marca.assinatura],
});

export function boasVindas(d: {
  para: string;
  responsavel: string;
  barbearia: string;
  paginaUrl: string;
  painelUrl: string;
  ligacaoPalavraPasse: string | null;
  guia?: Anexo | null;
}): Email {
  const acesso: BlocoEmail[] = d.ligacaoPalavraPasse
    ? [t.definir, { botao: t.definirBotao, url: d.ligacaoPalavraPasse }]
    : [t.jaTemConta];
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: t.boasVindasAssunto(d.barbearia),
    ...emailDaMarca(
      corpo(d.responsavel, [
        t.ativa(d.barbearia),
        ...acesso,
        { titulo: t.enderecosTitulo },
        {
          pares: [
            [t.pagina, d.paginaUrl],
            [t.painel, d.painelUrl],
          ],
        },
        ...(d.guia ? [t.guiaAnexo(d.barbearia)] : []),
        t.equipa,
        { titulo: t.imagensTitulo },
        t.imagensIntro,
        { lista: t.imagens },
        t.duvidas,
      ]),
      APOIO,
    ),
    responderPara: APOIO,
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
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: t.guiaAssunto(d.barbearia),
    ...emailDaMarca(corpo(d.responsavel, [t.guiaReenvio(d.barbearia), t.duvidas]), APOIO),
    responderPara: APOIO,
    anexos: [{ nome: d.guia.nome, conteudo: d.guia.conteudo }],
  };
}

export function respostaRejeicao(d: {
  para: string;
  responsavel: string;
  barbearia: string;
  motivo: string;
}): Email {
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: t.rejeicaoAssunto(d.barbearia),
    ...emailDaMarca(
      corpo(d.responsavel, [
        t.rejeicao(d.barbearia),
        { destaque: t.motivoTitulo, nota: d.motivo },
        t.rejeicaoContacto,
      ]),
      `comercial@${DOMINIO}`,
    ),
    responderPara: `comercial@${DOMINIO}`,
  };
}
