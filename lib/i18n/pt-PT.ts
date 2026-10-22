// Textos visíveis em português de Portugal (base). Nenhum texto fica escrito nos componentes.

export const textos = {
  marca: {
    nome: "InstaBarber",
    assinatura: "InstaBarber · Performa LAB",
    assinaturaComercial: "Comercial InstaBarber",
    rotuloWhatsapp: "WhatsApp",
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
    },
    respostaVisitante: {
      assunto: (ref: string) => `Recebemos o teu pedido de contacto · ${ref}`,
      corpo: (primeiroNome: string, ref: string) =>
        [
          `Olá ${primeiroNome},`,
          "",
          "Obrigado pelo interesse no InstaBarber. Recebemos o teu pedido e a nossa equipa comercial entra em contacto contigo em breve, por telefone ou mensagem, para perceber a tua barbearia e mostrar como o sistema pode ajudar.",
          "",
          `Referência do pedido: ${ref}`,
          "Se nos escreveres ou ligares, indica esta referência para te atendermos mais depressa.",
          "",
          "Se preferires falar já connosco, responde a este e-mail ou escreve-nos no WhatsApp, no número abaixo.",
          "",
          "Se não foste tu a fazer este pedido, podes ignorar esta mensagem.",
          "",
          "Com os melhores cumprimentos,",
        ].join("\n"),
    },
  },
} as const;
