import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";

/** Lembrete de vencimento à barbearia (O.9): de apoio@, com o texto que o operador reviu. */
export function emailLembreteVencimento(d: {
  para: string;
  barbearia: string;
  vencimento: string;
  texto: string;
}): Email {
  return {
    de: enderecos.apoio(),
    para: d.para,
    assunto: textos.financas.vencimentos.assunto(d.barbearia, d.vencimento),
    texto: d.texto,
    responderPara: `apoio@${DOMINIO}`,
  };
}
