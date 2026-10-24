// Textos visíveis em português de Portugal (base). Nenhum texto fica escrito nos componentes.

import { acesso } from "./pt-PT/acesso";
import { adesao } from "./pt-PT/adesao";
import { agenda, inicio, mensagensWhatsApp, upgrade } from "./pt-PT/agenda";
import { admin } from "./pt-PT/admin";
import { clientes } from "./pt-PT/clientes";
import { comercial } from "./pt-PT/comercial";
import { comum } from "./pt-PT/comum";
import { filas, mensagensLote } from "./pt-PT/filas";
import { financeiro, plano } from "./pt-PT/financeiro";
import { legal } from "./pt-PT/legal";
import { loja } from "./pt-PT/loja";
import { paineis } from "./pt-PT/paineis";
import { profissional } from "./pt-PT/profissional";
import { relatorio } from "./pt-PT/relatorio";
import { sistema } from "./pt-PT/sistema";

export const textos = {
  marca: {
    nome: "InstaBarber",
    assinatura: "InstaBarber · Performa LAB",
    assinaturaComercial: "Comercial InstaBarber",
    apoio: "apoio@instabarber.pt",
    instagram: { texto: "@instabarberpt", url: "https://www.instagram.com/instabarberpt/" },
  },
  contacto: {
    campos: {
      ref: "Referência",
      nome: "Nome",
      telemovel: "Telemóvel",
      email: "E-mail",
      distrito: "Distrito",
      cidade: "Cidade ou concelho",
      barbearia: "Barbearia",
      barbeiros: "Barbeiros",
      dificuldade: "Maior dificuldade",
      calculadora: "Calculadora",
    },
    vazio: "—",
    avisoComercial: {
      assunto: (ref: string, nome: string) => `Novo pedido de contacto · ${nome} · ${ref}`,
      assuntoPasso2: (ref: string, nome: string) =>
        `Pedido de contacto completo · ${nome} · ${ref}`,
      introducao: "Pedido de contacto feito na landing (instabarber.pt).",
      introducaoPasso2: "O visitante completou o passo 2 do pedido de contacto.",
      responder: "Responder a este e-mail escreve diretamente ao visitante.",
      crm: (endereco: string) => `No CRM: ${endereco}`,
    },
    respostaVisitante: {
      assunto: (ref: string) => `Recebemos o teu pedido de contacto · ${ref}`,
      saudacao: (primeiroNome: string) => `Olá ${primeiroNome},`,
      paragrafos: [
        "Obrigado pelo interesse no InstaBarber. Recebemos o teu pedido e a nossa equipa comercial entra em contacto contigo em breve, por telefone ou mensagem, para perceber a tua barbearia e mostrar como o sistema pode ajudar.",
      ],
      referencia: (ref: string) => `Referência do pedido: ${ref}`,
      dicaReferencia:
        "Se nos escreveres ou ligares, indica esta referência para te atendermos mais depressa.",
      paragrafosFinais: [
        "Se preferires falar já connosco, responde a este e-mail ou escreve-nos no WhatsApp, no número abaixo.",
        "Se não foste tu a fazer este pedido, podes ignorar esta mensagem.",
      ],
      despedida: "Com os melhores cumprimentos,",
    },
  },
  comum,
  legal,
  acesso,
  paineis,
  admin,
  comercial,
  adesao,
  agenda,
  filas,
  inicio,
  mensagensWhatsApp,
  mensagensLote,
  upgrade,
  clientes,
  loja,
  sistema,
  profissional,
  financeiro,
  plano,
  relatorio,
} as const;
