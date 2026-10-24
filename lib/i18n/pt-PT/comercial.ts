// Textos do Comercial do Admin (Parte N): funil, leads e histórico.

export const comercial = {
  titulo: "Comercial",
  separadores: { funil: "Funil", leads: "Leads" } as Record<string, string>,
  estados: {
    novo: "Novo",
    contactado: "Contactado",
    demonstracao: "Demonstração",
    proposta: "Proposta",
    ganho: "Ganho",
    perdido: "Perdido",
  } as Record<string, string>,
  origens: {
    landing: "Site",
    whatsapp: "WhatsApp",
    email: "E-mail",
    indicacao: "Indicação",
    visita: "Visita",
    outro: "Outro",
  } as Record<string, string>,
  funil: {
    leads: (n: number) => (n === 1 ? "1 lead" : `${n} leads`),
    potencial: "Valor potencial por mês",
    vazio: "Sem leads neste estado.",
    vencida: "Próxima ação vencida",
  },
  leads: {
    novo: "Novo lead",
    pesquisar: "Pesquisar por nome, barbearia, cidade, telefone ou e-mail",
    filtrar: "Filtrar",
    todos: "Todos",
    vistas: { todos: "Todos", incompletos: "Incompletos" } as Record<string, string>,
    incompletosAjuda:
      "Quem enviou o passo 1 do formulário do site e não completou o passo 2. Nada do que não foi enviado se guarda.",
    vazio: "Nenhum lead com estes filtros.",
    colunas: {
      contacto: "Contacto",
      barbearia: "Barbearia",
      estado: "Estado",
      origem: "Origem",
      proxima: "Próxima ação",
      ultimo: "Último contacto",
    },
    semAcao: "Sem próxima ação",
  },
  ficha: {
    voltar: "Voltar aos leads",
    dados: "Dados do lead",
    guardar: "Guardar dados",
    guardado: "Dados guardados.",
    estado: "Estado",
    mudarEstado: "Mudar estado",
    motivo: "Motivo da perda",
    motivoAjuda: "Obrigatório para marcar como perdido.",
    ganhoFinal: "Ganho: o lead fechou contrato e não volta atrás.",
    ganhoSoContrato: "«Ganho» só chega ao assinar o contrato.",
    registar: "Registar contacto",
    tipoEvento: "Tipo",
    tipos: { nota: "Nota", chamada: "Chamada", mensagem: "Mensagem" } as Record<string, string>,
    texto: "O que aconteceu",
    proximaAcao: "Próxima ação",
    proximaAcaoEm: "Data da próxima ação",
    registarBotao: "Registar",
    registado: "Contacto registado.",
    historico: "Histórico",
    semHistorico: "Ainda sem histórico.",
    eventos: {
      nota: "Nota",
      chamada: "Chamada",
      mensagem: "Mensagem",
      estado: "Estado",
      proposta: "Proposta",
      contrato: "Contrato",
      sistema: "Sistema",
    } as Record<string, string>,
    mudouEstado: (de: string, para: string) => `De «${de}» para «${para}».`,
    passo2: (dificuldade?: string, distrito?: string) =>
      [dificuldade && `Maior dificuldade: ${dificuldade}`, distrito && `Distrito: ${distrito}`]
        .filter(Boolean)
        .join(" · "),
  },
  campos: {
    nome_contacto: "Nome do contacto",
    nome_barbearia: "Barbearia",
    cidade: "Cidade",
    telefone: "Telemóvel",
    email: "E-mail",
    n_barbeiros: "N.º de barbeiros",
    origem: "Origem",
  } as Record<string, string>,
  criar: "Criar lead",
  erros: {
    nome: "Escreva o nome do contacto.",
    contacto: "Indique o telemóvel ou o e-mail.",
    email: "E-mail inválido.",
    telefone: "Telemóvel inválido.",
    motivo: "Escreva o motivo.",
    texto: "Escreva o que aconteceu.",
    generico: "Não foi possível guardar. Tente outra vez.",
  } as Record<string, string>,
  alertas: {
    titulo: "Comercial",
    leadsParados: (n: number) =>
      n === 1
        ? "1 lead novo há mais de dois dias úteis"
        : `${n} leads novos há mais de dois dias úteis`,
    propostasAExpirar: (n: number) =>
      n === 1 ? "1 proposta a expirar em 3 dias" : `${n} propostas a expirar em 3 dias`,
    abrir: "Abrir o funil",
  },
} as const;
