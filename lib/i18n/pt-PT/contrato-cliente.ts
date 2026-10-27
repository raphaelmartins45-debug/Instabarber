// Contrato enviado ao cliente por e-mail e carregado por ele (D-181): os botões da equipa, os
// e-mails e a página do cliente (/adesao/contrato/<ligação>).

export const contratoCliente = {
  equipa: {
    enviar: "Enviar ao cliente por e-mail",
    reenviar: "Enviar outra vez por e-mail",
    enviado: (email: string) =>
      `Contrato enviado para ${email}, com a ligação para o carregar assinado.`,
    enviadoEm: (data: string) => `Enviado ao cliente a ${data}.`,
    semEmail: "O contratante não tem e-mail. Gere o contrato outra vez com o e-mail.",
    erroEnvio: "Não foi possível enviar. Tente outra vez.",
    porConferir: "O cliente carregou o contrato assinado. Confira-o antes de aprovar.",
    ver: "Ver o PDF carregado",
    data: "Data da assinatura",
    aprovar: "Aprovar e enviar a adesão",
    aprovado: "Contrato aprovado. O cliente recebeu o agradecimento com a ligação para a adesão.",
    aprovadoSemEmail:
      "Contrato aprovado, mas o e-mail ao cliente falhou. Envie a ligação da adesão à mão.",
    recusar: "Recusar",
    motivo: "Motivo da recusa (o cliente vê-o)",
    confirmarRecusa: "Recusar e pedir outra vez",
    recusado: "Recusado. O cliente recebeu o motivo e uma ligação nova para carregar outra vez.",
    ultimaRecusa: (motivo: string) =>
      `Último carregamento recusado: ${motivo}. À espera de que o cliente carregue outra vez.`,
    erro: "Não foi possível concluir. Tente outra vez.",
  },
  emails: {
    envioAssunto: (numero: string) => `O seu contrato InstaBarber (${numero})`,
    ola: (nome: string) => `Olá ${nome},`,
    envio: (numero: string) => [
      "Obrigado pela confiança na InstaBarber.",
      `Segue em anexo o contrato ${numero}, com as condições da proposta que aceitou.`,
    ],
    passosTitulo: "Para concluir, são quatro passos:",
    passos: [
      "1. Leia o contrato com calma. Qualquer dúvida, responda a este e-mail.",
      "2. Escreva a data e assine na última página, à mão ou com a assinatura digital (Cartão de Cidadão ou Chave Móvel Digital).",
      "3. Guarde-o em PDF (digitalizado ou fotografado com boa luz, todas as páginas).",
      "4. Carregue o PDF assinado nesta ligação:",
    ],
    ligacaoNota: "A ligação é só sua e vale 30 dias.",
    depois:
      "Depois de conferirmos o contrato, recebe a confirmação e a ligação para o formulário de adesão, onde envia o logótipo e os dados da barbearia.",
    despedida: "Com os melhores cumprimentos,",
    obrigadoAssunto: (numero: string) => `Contrato ${numero} assinado: bem-vindo à InstaBarber`,
    obrigado: (numero: string) => [
      `Recebemos e conferimos o contrato ${numero}. Obrigado pela confiança: a partir de agora, estamos juntos.`,
      "O próximo passo é o formulário de adesão, já preenchido com os dados do contrato. Lá envia o logótipo, as fotografias, o horário e os serviços da barbearia:",
    ],
    adesaoNota: "A ligação é de uso único e vale 14 dias.",
    obrigadoDepois:
      "Assim que a adesão for aprovada, recebe o e-mail de boas-vindas com o acesso ao painel e o guia de arranque da sua barbearia, com os seus endereços e os primeiros passos.",
    recusaAssunto: (numero: string) => `Contrato ${numero}: falta um pormenor`,
    recusa: (numero: string, motivo: string) => [
      `Recebemos o contrato ${numero} assinado, obrigado. Antes de o aprovarmos, falta um pormenor:`,
      motivo,
      "Pode carregar o PDF corrigido nesta ligação nova:",
    ],
    avisoAssunto: (numero: string, nome: string) =>
      `Contrato ${numero} carregado pelo cliente · ${nome}`,
    aviso: (numero: string, nome: string) =>
      `O cliente ${nome} carregou o contrato ${numero} assinado. Confira-o e aprove na ficha do lead:`,
  },
  pagina: {
    titulo: "O seu contrato InstaBarber",
    ajuda: (numero: string, contratante: string) => `Contrato ${numero} · ${contratante}`,
    passos: [
      "Abra o contrato que recebeu em anexo no e-mail e leia-o com calma.",
      "Escreva a data e assine na última página, à mão ou com a assinatura digital.",
      "Carregue aqui o PDF assinado (até 10 MB).",
    ],
    ficheiro: "PDF assinado",
    carregar: "Carregar o contrato assinado",
    aCarregar: "A carregar…",
    recusado: (motivo: string) => `Falta um pormenor: ${motivo}`,
    carregado:
      "Recebemos o contrato assinado. Vamos conferi-lo e enviamos-lhe a confirmação por e-mail.",
    carregadoAntes:
      "Já recebemos o contrato assinado e estamos a conferi-lo. Se precisar, pode carregar outra vez.",
    invalida:
      "Esta ligação já não é válida: o contrato já foi assinado, ou a ligação expirou. Fale connosco em comercial@instabarber.pt.",
    erros: {
      ficheiro: "Escolha um PDF até 10 MB.",
      limite: "Demasiadas tentativas. Tente daqui a uma hora.",
      generico: "Não foi possível carregar. Tente outra vez.",
    } as Record<string, string>,
  },
} as const;
