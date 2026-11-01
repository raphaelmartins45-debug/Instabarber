import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import type { PedidoContactoFase1, PedidoContactoFase2 } from "@/lib/validacao/contacto";
import { variavelOpcional } from "@/lib/configuracao/ambiente";
import { DOMINIO, enderecos } from "./enderecos";
import type { Email } from "./enviar";
import { emailDaMarca } from "./timbrado-marca";

// Modelos dos e-mails do pedido de contacto da landing (D-46, D-50): os avisos internos em texto
// simples; a resposta ao visitante timbrada, com a assinatura comercial (D-101, D-184).

const t = textos.contacto;
// Os leads do site ficam no CRM do Admin (N.3), só no domínio principal.
const ENDERECO_CRM = `https://${DOMINIO}/admin/comercial/leads`;

function linhas(pares: [string, string][]): string {
  return pares.map(([rotulo, valor]) => `${rotulo}: ${valor || t.vazio}`).join("\n");
}

export function avisoComercialFase1(ref: string, p: PedidoContactoFase1): Email {
  return {
    de: enderecos.remetente(),
    para: enderecos.comercial(),
    responderPara: p.email,
    assunto: t.avisoComercial.assunto(ref, p.nome),
    texto: [
      t.avisoComercial.introducao,
      "",
      linhas([
        [t.campos.ref, ref],
        [t.campos.nome, p.nome],
        [t.campos.telemovel, p.telemovel],
        [t.campos.email, p.email],
      ]),
      "",
      t.avisoComercial.responder,
      t.avisoComercial.crm(ENDERECO_CRM),
      "",
      textos.marca.assinatura,
    ].join("\n"),
  };
}

export function avisoComercialFase2(p: PedidoContactoFase2): Email {
  return {
    de: enderecos.remetente(),
    para: enderecos.comercial(),
    ...(p.email ? { responderPara: p.email } : {}),
    assunto: t.avisoComercial.assuntoPasso2(p.ref, p.nome || t.vazio),
    texto: [
      t.avisoComercial.introducaoPasso2,
      "",
      linhas([
        [t.campos.ref, p.ref],
        [t.campos.nome, p.nome],
        [t.campos.telemovel, p.telemovel],
        [t.campos.email, p.email],
        [t.campos.distrito, p.distrito],
        [t.campos.cidade, p.cidade],
        [t.campos.barbearia, p.barbearia],
        [t.campos.barbeiros, p.barbeiros],
        [t.campos.dificuldade, p.dificuldade],
        [t.campos.calculadora, p.calculadora],
      ]),
      "",
      t.avisoComercial.crm(ENDERECO_CRM),
      "",
      textos.marca.assinatura,
    ].join("\n"),
  };
}

/** Assinatura dos e-mails comerciais para fora: «Comercial InstaBarber» e o número de WhatsApp por baixo, sem rótulo (D-101). */
export function assinaturaComercial(): string[] {
  const telefone = variavelOpcional("TELEFONE_COMERCIAL_TXT");
  return [textos.marca.assinaturaComercial, ...(telefone ? [telefone] : [])];
}

export function respostaVisitante(ref: string, p: PedidoContactoFase1): Email {
  const primeiroNome = p.nome.split(/\s+/)[0] ?? p.nome;
  const r = t.respostaVisitante;
  const comercial = enderecos.comercial();
  const { texto: instagramTexto, url: instagramUrl } = textos.marca.instagram;
  return {
    de: enderecos.apoio(),
    para: p.email,
    responderPara: comercial,
    assunto: r.assunto(ref),
    ...emailDaMarca(
      {
        saudacao: r.saudacao(primeiroNome),
        corpo: [
          ...r.paragrafos,
          { destaque: r.referencia(ref), nota: r.dicaReferencia },
          ...r.paragrafosFinais,
        ],
        despedida: r.despedida,
        assinatura: assinaturaComercial(),
      },
      comercial,
      `${comercial} · Instagram: ${instagramTexto} (${instagramUrl})`,
    ),
  };
}
