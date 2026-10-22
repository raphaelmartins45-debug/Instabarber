import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import type { PedidoContactoFase1, PedidoContactoFase2 } from "@/lib/validacao/contacto";
import { enderecos } from "./enderecos";
import type { Email } from "./enviar";

// Modelos dos e-mails do pedido de contacto da landing (D-46, D-50). Só texto simples.

const t = textos.contacto;

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
      textos.marca.assinatura,
    ].join("\n"),
  };
}

export function respostaVisitante(ref: string, p: PedidoContactoFase1): Email {
  const primeiroNome = p.nome.split(/\s+/)[0] ?? p.nome;
  return {
    de: enderecos.apoio(),
    para: p.email,
    assunto: t.respostaVisitante.assunto(ref),
    texto: [t.respostaVisitante.corpo(primeiroNome, ref), "", textos.marca.assinatura].join("\n"),
  };
}
