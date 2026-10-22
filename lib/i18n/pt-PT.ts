// Textos visíveis em português de Portugal (base). Nenhum texto fica escrito nos componentes.

export const textos = {
  marca: {
    nome: "InstaBarber",
    assinatura: "InstaBarber · Performa LAB",
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
          "Recebemos o teu pedido de contacto. Em breve vais receber uma chamada ou mensagem da nossa equipa comercial.",
          "",
          `A referência do teu pedido é ${ref}. Se nos escreveres, indica-a.`,
          "",
          "Se não foste tu a fazer este pedido, ignora este e-mail.",
        ].join("\n"),
    },
  },
} as const;
