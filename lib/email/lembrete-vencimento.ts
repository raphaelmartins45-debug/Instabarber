import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import { emailDaMarca } from "./timbrado-marca";

const APOIO = `apoio@${DOMINIO}`;

/**
 * Lembrete de vencimento à barbearia (O.9): de apoio@, com o texto que o operador reviu. O texto
 * simples segue tal como ficou; o HTML timbrado (D-184) mostra os mesmos parágrafos e, se o texto
 * acabar na assinatura da marca, desenha-a como assinatura.
 */
export function emailLembreteVencimento(d: {
  para: string;
  barbearia: string;
  vencimento: string;
  texto: string;
}): Email {
  const paragrafos = d.texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const assinado = paragrafos.at(-1) === textos.marca.assinatura;
  const { html } = emailDaMarca(
    {
      saudacao: "",
      corpo: assinado ? paragrafos.slice(0, -1) : paragrafos,
      despedida: "",
      assinatura: assinado ? [textos.marca.assinatura] : [],
    },
    APOIO,
  );
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: textos.financas.vencimentos.assunto(d.barbearia, d.vencimento),
    texto: d.texto,
    html,
    responderPara: APOIO,
  };
}
