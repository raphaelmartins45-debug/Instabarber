// Comprovativos de pagamento da mensalidade (D-168): a barbearia envia, a Performa LAB confere.

export const comprovativos = {
  titulo: "Pagar a mensalidade",
  ajuda: (periodo: string, valor: string) =>
    `Período a pagar: ${periodo}. Valor: ${valor}. Pague por MB WAY ou transferência e envie aqui o comprovativo; a InstaBarber confere e confirma por e-mail.`,
  ajudaSemValor: (periodo: string) =>
    `Período a pagar: ${periodo}. Pague por MB WAY ou transferência e envie aqui o comprovativo; a InstaBarber confere e confirma por e-mail.`,
  metodo: "Como pagou",
  metodos: { mbway: "MB WAY", transferencia: "Transferência" } as Record<string, string>,
  valor: "Valor pago (€)",
  data: "Data do pagamento",
  ficheiro: "Comprovativo",
  enviar: "Enviar comprovativo",
  aEnviar: "A enviar…",
  enviado: "Comprovativo enviado. Recebe um e-mail quando for confirmado.",
  emAnalise: (periodo: string) =>
    `O comprovativo do período ${periodo} está em análise. Recebe um e-mail quando for confirmado.`,
  historico: "Comprovativos enviados",
  vazio: "Ainda não enviou nenhum comprovativo.",
  colunas: {
    enviado: "Enviado",
    periodo: "Período",
    valor: "Valor",
    metodo: "Método",
    estado: "Estado",
  },
  estados: {
    pendente: "Em análise",
    aprovado: "Confirmado",
    recusado: "Recusado",
  } as Record<string, string>,
  recusadoPorque: (motivo: string) => `Recusado: ${motivo}`,
  estadosFatura: { paga: "Paga", emAnalise: "Em análise", porPagar: "Por pagar" },
  erros: {
    ficheiro: "Escolha uma imagem JPG ou PNG, ou um PDF, até 5 MB.",
    valor: "Indique o valor pago.",
    data: "Indique a data do pagamento (hoje ou antes, até 6 meses).",
    metodo: "Escolha como pagou.",
    ja_pendente: "Já há um comprovativo deste período em análise.",
    sem_permissao: "Só o proprietário da barbearia envia comprovativos.",
    carregar: "Não foi possível carregar o ficheiro. Tente outra vez.",
    generico: "Não foi possível enviar. Tente outra vez.",
  } as Record<string, string>,
  // Admin
  admin: {
    painel: "Comprovativos por confirmar",
    semPainel: "Sem comprovativos por confirmar.",
    detalhe: (valor: string, metodo: string, periodo: string) =>
      `${valor} · ${metodo} · ${periodo}`,
    conferir: "Conferir",
    titulo: "Comprovativo de pagamento",
    abrirFicheiro: "Abrir o comprovativo",
    semPrevisualizacao: "Este comprovativo é um PDF: abra-o para conferir.",
    dados: "Dados",
    campos: {
      barbearia: "Barbearia",
      responsavel: "Responsável",
      plano: "Plano",
      periodo: "Período",
      fatura: "Fatura",
      semFatura: "Sem fatura emitida",
      esperado: "Mensalidade (com IVA)",
      pago: "Valor pago",
      metodo: "Método",
      data: "Data do pagamento",
      enviado: "Enviado em",
      estado: "Estado",
    },
    diferenca: (v: string) => `O valor pago difere da mensalidade em ${v}.`,
    aprovar: "Aprovar pagamento",
    confirmarAprovar:
      "Regista o recebimento, marca a fatura como paga, põe a barbearia em dia, avança o próximo vencimento (e reativa-a se estava suspensa) e envia o e-mail de confirmação.",
    aprovado: "Pagamento aprovado e e-mail de confirmação enviado.",
    aprovadoSemEmail: "Pagamento aprovado, mas o e-mail de confirmação não saiu.",
    recusar: "Recusar",
    motivo: "Motivo da recusa (a barbearia vê)",
    recusado: "Comprovativo recusado e barbearia avisada por e-mail.",
    erros: {
      ja_decidido: "Este comprovativo já foi decidido.",
      motivo: "Escreva o motivo (pelo menos 3 caracteres).",
      generico: "Não foi possível concluir. Tente outra vez.",
    } as Record<string, string>,
  },
  email: {
    avisoAssunto: (barbearia: string, valor: string) =>
      `Comprovativo de pagamento · ${barbearia} · ${valor}`,
    aviso: (d: {
      barbearia: string;
      responsavel: string;
      plano: string;
      periodicidade: string;
      periodo: string;
      fatura: string;
      esperado: string;
      valor: string;
      metodo: string;
      data: string;
      ligacao: string;
    }) =>
      [
        `${d.barbearia} enviou um comprovativo de pagamento.`,
        "",
        `Responsável: ${d.responsavel}`,
        `Plano: ${d.plano} (${d.periodicidade})`,
        `Período: ${d.periodo}`,
        `Fatura: ${d.fatura}`,
        `Mensalidade (com IVA): ${d.esperado}`,
        `Valor pago: ${d.valor}`,
        `Método: ${d.metodo}`,
        `Data do pagamento: ${d.data}`,
        "",
        `Conferir e aprovar: ${d.ligacao}`,
      ].join("\n"),
    confirmadoAssunto: (barbearia: string) => `Pagamento confirmado · ${barbearia}`,
    confirmado: (d: {
      responsavel: string;
      barbearia: string;
      periodo: string;
      valor: string;
      metodo: string;
      data: string;
      vencimento: string;
    }) =>
      [
        `Olá ${d.responsavel},`,
        "",
        `Confirmamos o pagamento da mensalidade da ${d.barbearia}.`,
        "",
        `Período: ${d.periodo}`,
        `Valor: ${d.valor}`,
        `Método: ${d.metodo}`,
        `Data do pagamento: ${d.data}`,
        `Próximo vencimento: ${d.vencimento}`,
        "",
        "Este e-mail não é documento fiscal. A fatura segue em separado.",
        "Pode consultar os pagamentos em «O meu plano».",
      ].join("\n"),
    recusadoAssunto: (barbearia: string) =>
      `Comprovativo de pagamento por confirmar · ${barbearia}`,
    recusado: (d: { responsavel: string; periodo: string; motivo: string }) =>
      [
        `Olá ${d.responsavel},`,
        "",
        `Não conseguimos confirmar o comprovativo do período ${d.periodo}.`,
        `Motivo: ${d.motivo}`,
        "",
        "Pode enviar outro em «O meu plano». Qualquer dúvida, responda a este e-mail.",
      ].join("\n"),
  },
};
