import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";

// E-mails dos comprovativos de pagamento (D-168): o aviso à Performa LAB quando chega um, e a
// resposta à barbearia quando é confirmado ou recusado. Nenhum é documento fiscal.

const e = textos.comprovativos.email;
const assinar = (linhas: string) => `${linhas}\n\n${textos.marca.assinatura}`;

type Aviso = Parameters<typeof e.aviso>[0];

/** Aviso à Performa LAB, para o mesmo endereço das adesões (L.2). */
export function avisoComprovativo(d: Aviso): Email {
  return {
    de: enderecos.remetente(),
    para: enderecos.notificacoes(),
    assunto: e.avisoAssunto(d.barbearia, d.valor),
    texto: assinar(e.aviso(d)),
  };
}

export function emailPagamentoConfirmado(
  para: string,
  d: Parameters<typeof e.confirmado>[0],
): Email {
  return {
    de: enderecos.apoio(),
    para,
    assunto: e.confirmadoAssunto(d.barbearia),
    texto: assinar(e.confirmado(d)),
    responderPara: `apoio@${DOMINIO}`,
  };
}

export function emailComprovativoRecusado(
  para: string,
  barbearia: string,
  d: Parameters<typeof e.recusado>[0],
): Email {
  return {
    de: enderecos.apoio(),
    para,
    assunto: e.recusadoAssunto(barbearia),
    texto: assinar(e.recusado(d)),
    responderPara: `apoio@${DOMINIO}`,
  };
}
