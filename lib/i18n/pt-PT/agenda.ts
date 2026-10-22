// Agenda e Início do painel da barbearia (E.2, E.3).

export const agenda = {
  titulo: "Agenda",
  hoje: "Hoje",
  anterior: "Dia anterior",
  seguinte: "Dia seguinte",
  escolherDia: "Escolher o dia",
  todos: "Todos os profissionais",
  fechada: "A barbearia está fechada à marcação online. O balcão continua a funcionar.",
  semProfissionais: "Ainda não há profissionais ativos.",
  semMarcacoes: "Sem marcações neste dia.",
  livre: "Livre",
  livres: "Vagas livres",
  ausente: "Ausente",
  orfas: (n: number) =>
    n === 1
      ? "Há 1 marcação sem profissional. Atribua-a na Gestão do sistema."
      : `Há ${n} marcações sem profissional. Atribua-as na Gestão do sistema.`,
  indicadores: { marcacoes: "Marcações", faturacao: "Faturação", ocupacao: "Ocupação" },
  tiposAusencia: {
    ferias: "Férias",
    folga: "Folga",
    formacao: "Formação",
    doenca: "Doença",
    outro: "Ausência",
  } as Record<string, string>,
  estados: {
    reservada: "Reservada",
    agendada: "Agendada",
    concluida: "Concluída",
    falta: "Faltou",
    cancelada: "Cancelada",
  } as Record<string, string>,
  colunas: {
    hora: "Hora",
    cliente: "Cliente",
    servico: "Serviço",
    profissional: "Profissional",
    valor: "Valor",
    estado: "Estado",
    acoes: "Ações",
  },
  desconto: (p: number) => `−${p} %`,
  acoes: {
    concluir: "Concluir",
    faltou: "Faltou",
    lembrete: "Lembrete",
    lembreteAberto: "Lembrete aberto",
    cancelar: "Cancelar",
  },
  confirmarFalta: {
    titulo: "Marcar falta?",
    texto: "A marcação fica como falta e conta para a política de faltas do cliente.",
    botao: "Marcar falta",
  },
  confirmarCancelar: {
    titulo: "Cancelar a marcação?",
    texto: "O horário fica livre. Esta ação não se desfaz.",
    botao: "Cancelar a marcação",
  },
  concluir: {
    titulo: "Concluir o serviço",
    valor: "Valor cobrado (€)",
    valorAjuda: "Pode acrescentar um extra pago ao balcão.",
    modo: "Forma de pagamento",
    normal: "Pagamento normal",
    clube: "Usar crédito do clube",
    premio: (selos: number) => `Usar prémio de selos (${selos} selos)`,
    cartao: "Pagar com cartão oferta",
    codigo: "Código do cartão",
    valorCartao: "Valor a descontar do cartão (€)",
    selos: (n: number) => `Saldo de selos: ${n}`,
    confirmar: "Concluir",
    concluido: "Serviço concluído.",
  },
  balcao: {
    marcar: "Marcar cliente",
    registar: "Registar serviço ao balcão",
    tituloMarcar: "Marcar ao balcão",
    tituloRegistar: "Registar serviço feito agora",
    telefone: "Telemóvel do cliente",
    procurar: "Procurar",
    encontrado: (nome: string) => `Cliente: ${nome}`,
    novo: "Cliente novo: escreva o nome.",
    nome: "Nome do cliente",
    consentimento: "O cliente aceita receber mensagens da barbearia por WhatsApp.",
    servico: "Serviço",
    profissional: "Profissional",
    dia: "Dia",
    hora: "Hora",
    semVagas: "Sem vagas neste dia para este serviço.",
    escolherHora: "Escolha a hora",
    marcar_botao: "Marcar",
    registar_botao: "Registar e concluir",
    marcado: "Marcação feita.",
    registado: "Serviço registado.",
  },
  orfasSeccao: {
    titulo: "Marcações sem profissional",
    vazio: "Não há marcações sem profissional.",
    atribuir: "Atribuir",
    escolher: "Escolher profissional",
    atribuida: "Marcação atribuída.",
  },
  erros: {
    ocupado: "Esse horário já está ocupado.",
    fora_do_horario: "Fora do horário de trabalho.",
    dia_de_descanso: "É dia de descanso.",
    intervalo_almoco: "Coincide com o intervalo de almoço.",
    feriado: "É feriado e a barbearia está fechada.",
    ausencia: "O profissional está ausente nesse horário.",
    servico_invalido: "Escolha um serviço ativo.",
    profissional_invalido: "Escolha um profissional ativo.",
    barbearia_indisponivel: "A barbearia não está ativa.",
    marcacao_invalida: "Esta marcação já não está agendada.",
    ainda_nao_comecou: "Só pode marcar falta depois da hora da marcação.",
    sem_credito: "O cliente não tem crédito do clube para este serviço.",
    servico_nao_e_premio: "Este serviço não é o prémio dos selos.",
    selos_insuficientes: "O cliente não tem selos suficientes.",
    sem_profissional: "Atribua um profissional antes de concluir.",
    sem_permissao: "Sem permissão para esta marcação.",
    cartao_invalido: "Cartão oferta inválido, expirado ou anulado.",
    cartao_saldo: "O cartão não tem saldo suficiente.",
    telefone: "Escreva um telemóvel válido.",
    nome: "Escreva o nome do cliente.",
    valor: "Escreva um valor válido.",
    hora: "Escolha a hora.",
    erro: "Não foi possível guardar. Tente outra vez.",
  } as Record<string, string>,
} as const;

export const inicio = {
  titulo: "Início",
  indicadores: {
    faturadoHoje: "Faturado hoje",
    servicos: (n: number) => (n === 1 ? "1 serviço" : `${n} serviços`),
    previsao: "Previsão do dia",
    previsaoAjuda: "Agendado e ainda não atendido",
    faturadoMes: "Faturado no mês",
    faltaObjetivo: "Falta para o objetivo",
    semObjetivo: "Sem objetivo definido",
    diasRestantes: (n: number) =>
      n === 1 ? "1 dia de funcionamento" : `${n} dias de funcionamento`,
    faltaHoje: "Falta para o objetivo do dia",
    ticket: "Ticket médio",
    regresso: "Taxa de regresso",
    percentagemObjetivo: (p: number) => `${p} % do objetivo`,
  },
  hojeTitulo: "Marcações de hoje",
  contasTitulo: "Contas a pagar pendentes",
  contasVazio: "Sem contas por pagar.",
  paguei: "Paguei",
  contactarTitulo: "Clientes a contactar",
  contactarVazio: "Ninguém por contactar.",
  mensagem: "Mensagem",
} as const;

export const mensagensWhatsApp = {
  lembrete: (d: {
    nome: string;
    servico: string;
    data: string;
    hora: string;
    barbeiro: string;
    barbearia: string;
    minutos: number | null;
  }) =>
    `Olá ${d.nome}! Lembramos a sua marcação na ${d.barbearia}: ${d.servico}, ${d.data} às ${d.hora}, com ${d.barbeiro}.` +
    (d.minutos !== null ? ` Faltam ${d.minutos} minutos.` : "") +
    " Até já!",
  posvenda: (d: {
    nome: string;
    servico: string;
    data: string;
    pagina: string;
    assinatura: string;
  }) =>
    `Olá ${d.nome}! Obrigado por ter vindo fazer ${d.servico} no dia ${d.data}. Quando quiser voltar, marque aqui: ${d.pagina} — ${d.assinatura}`,
  convite: (d: {
    nome: string;
    dias: number;
    servico: string;
    data: string;
    pagina: string;
    assinatura: string;
  }) =>
    `Olá ${d.nome}! Já passaram ${d.dias} dias desde o seu último ${d.servico} (${d.data}). Que tal marcar o próximo? ${d.pagina} — ${d.assinatura}`,
  reativacao: (d: {
    nome: string;
    dias: number;
    servico: string;
    data: string;
    pagina: string;
    assinatura: string;
  }) =>
    `Olá ${d.nome}! Há ${d.dias} dias que não o vemos — o último foi ${d.servico}, a ${d.data}. Temos saudades! Marque quando quiser: ${d.pagina} — ${d.assinatura}`,
  aniversario: (d: { nome: string; assinatura: string }) =>
    `Parabéns, ${d.nome}! Desejamos-lhe um dia muito feliz. Um abraço — ${d.assinatura}`,
  filaVaga: (d: { nome: string; servico: string; data: string; hora: string; barbearia: string }) =>
    `Olá ${d.nome}! Abriu uma vaga na ${d.barbearia}: ${d.servico}, ${d.data} às ${d.hora}. Se a quiser, responda a esta mensagem nos próximos 30 minutos. Até já!`,
  avaliacao: (d: { nome: string; ligacao: string; assinatura: string }) =>
    `Olá ${d.nome}! Obrigado pela visita. Se gostou, deixe-nos a sua avaliação no Google, ajuda muito: ${d.ligacao} — ${d.assinatura}`,
} as const;

export const upgrade = {
  titulo: "Disponível no plano Pro",
  texto:
    "No Pro, o WhatsApp abre com a mensagem pronta — o cliente certo, com o nome e o tempo sem vir já preenchidos — e só tens de carregar em enviar. Recuperas quem se está a perder sem escrever uma linha.",
  incluidos: (n: number) => `Com ${n} profissionais incluídos e todas as funções ativas.`,
  botao: (semIva: string, comIva: string) =>
    `Passar para o Pro — ${semIva}/mês (${comIva} com IVA)`,
  radar: (perdidos: number, valor: string) =>
    `${perdidos} clientes perdidos · ${valor} a recuperar. As mensagens de recuperação fazem parte do plano Pro.`,
  falar: "Para mudar de plano, fale com a InstaBarber.",
} as const;
