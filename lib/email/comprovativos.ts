import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import { emailDaMarca } from "./timbrado-marca";

// E-mails dos comprovativos de pagamento (D-168): o aviso à Performa LAB quando chega um, e a
// resposta à barbearia quando é confirmado ou recusado, timbrada (D-184). Nenhum é documento
// fiscal.

const e = textos.comprovativos.email;
const APOIO = `apoio@${DOMINIO}`;

type Aviso = Parameters<typeof e.aviso>[0];

/** Aviso à Performa LAB, para o mesmo endereço das adesões (L.2). */
export function avisoComprovativo(d: Aviso): Email {
  return {
    de: enderecos.remetente(),
    para: enderecos.notificacoes(),
    assunto: e.avisoAssunto(d.barbearia, d.valor),
    texto: `${e.aviso(d)}\n\n${textos.marca.assinatura}`,
  };
}

const assinado = { despedida: e.despedida, assinatura: [textos.marca.assinatura] };

export function emailPagamentoConfirmado(
  para: string,
  d: {
    responsavel: string;
    barbearia: string;
    periodo: string;
    valor: string;
    metodo: string;
    data: string;
    vencimento: string;
  },
): Email {
  const c = e.campos;
  return {
    de: enderecos.apoio(),
    para,
    assunto: e.confirmadoAssunto(d.barbearia),
    ...emailDaMarca(
      {
        saudacao: e.ola(d.responsavel),
        corpo: [
          e.confirmado(d.barbearia),
          {
            pares: [
              [c.periodo, d.periodo],
              [c.valor, d.valor],
              [c.metodo, d.metodo],
              [c.data, d.data],
              [c.vencimento, d.vencimento],
            ],
          },
          e.naoFiscal,
          e.consultar,
        ],
        ...assinado,
      },
      APOIO,
    ),
    responderPara: APOIO,
  };
}

export function emailComprovativoRecusado(
  para: string,
  barbearia: string,
  d: { responsavel: string; periodo: string; motivo: string },
): Email {
  return {
    de: enderecos.apoio(),
    para,
    assunto: e.recusadoAssunto(barbearia),
    ...emailDaMarca(
      {
        saudacao: e.ola(d.responsavel),
        corpo: [e.recusado(d.periodo), { destaque: e.motivo, nota: d.motivo }, e.reenviar],
        ...assinado,
      },
      APOIO,
    ),
    responderPara: APOIO,
  };
}
