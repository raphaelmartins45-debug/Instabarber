// Finanças da Performa LAB (Parte O). Valores sempre sem IVA, salvo onde se diz.

export const financas = {
  titulo: "Finanças",
  separadores: {
    resumo: "Resumo",
    custos: "Custos e contas",
    objetivo: "Objetivo e previsões",
    vencimentos: "Vencimentos",
    exportar: "Exportar",
  } as Record<string, string>,
  categorias: {
    infraestrutura: "Infraestrutura",
    dominios: "Domínios",
    ferramentas: "Ferramentas",
    contabilidade: "Contabilidade",
    marketing: "Marketing",
    outros: "Outros",
  } as Record<string, string>,
  tipos: { fixo: "Fixo", variavel: "Variável" } as Record<string, string>,
  periodicidades: { mensal: "Mensal", anual: "Anual", unico: "Único" } as Record<string, string>,
  estadosConta: { pendente: "Pendente", atrasada: "Atrasada", paga: "Paga" } as Record<
    string,
    string
  >,
  custos: {
    titulo: "Custos",
    ajuda:
      "O que a operação custa, sem IVA. Valores em dólares escrevem-se já em euros, pelo valor da fatura.",
    vazio: "Ainda sem custos registados.",
    novo: "Novo custo",
    editar: "Editar",
    guardar: "Guardar custo",
    guardado: "Custo guardado.",
    apagar: "Apagar",
    apagarTitulo: "Apagar este custo?",
    apagarTexto: "As contas ligadas a este custo ficam, sem a ligação.",
    terminar: "Dar fim hoje",
    partida: "Carregar os custos de partida (L.6)",
    partidaAjuda:
      "Sugestão com os serviços que a Performa LAB já usa. Confirme cada valor pela fatura e corrija o que for preciso.",
    mensalEquivalente: (v: string) => `${v} por mês`,
    totalMes: (fixos: string, variaveis: string) =>
      `Fixos ${fixos} · variáveis ${variaveis} por mês`,
    inativo: "Terminado",
    colunas: {
      descricao: "Descrição",
      categoria: "Categoria",
      tipo: "Tipo",
      valor: "Valor sem IVA",
      periodicidade: "Periodicidade",
      inicio: "Início",
      fim: "Fim",
    },
  },
  contas: {
    titulo: "Contas a pagar",
    vazio: "Sem contas a pagar.",
    nova: "Nova conta",
    guardar: "Guardar conta",
    guardada: "Conta guardada.",
    pagar: "Marcar paga hoje",
    apagar: "Apagar",
    apagarTitulo: "Apagar esta conta?",
    apagarTexto: "A conta sai da lista e do lucro de caixa.",
    gerar: "Gerar as contas do próximo mês",
    geradas: (n: number) =>
      n === 0
        ? "Nenhuma conta nova: as do próximo mês já existem."
        : n === 1
          ? "1 conta gerada."
          : `${n} contas geradas.`,
    filtros: { abertas: "Por pagar", todas: "Todas" } as Record<string, string>,
    colunas: {
      fornecedor: "Fornecedor",
      descricao: "Descrição",
      semIva: "Sem IVA",
      comIva: "Com IVA",
      vencimento: "Vencimento",
      estado: "Estado",
      pagaEm: "Paga a",
    },
  },
  campos: {
    descricao: "Descrição",
    categoria: "Categoria",
    tipo: "Tipo",
    valor_sem_iva: "Valor sem IVA (€)",
    valor_com_iva: "Valor com IVA (€)",
    periodicidade: "Periodicidade",
    data_inicio: "Data de início",
    data_fim: "Data de fim (opcional)",
    fornecedor: "Fornecedor",
    vencimento: "Vencimento",
    nota: "Nota (opcional)",
  } as Record<string, string>,
  erros: {
    descricao: "Escreva a descrição.",
    fornecedor: "Escreva o fornecedor.",
    valor: "Valor inválido.",
    comIva: "O valor com IVA não pode ser menor que o sem IVA.",
    data: "Data inválida.",
    fim: "O fim não pode ser antes do início.",
    generico: "Não foi possível guardar. Tente outra vez.",
  } as Record<string, string>,
  resumo: {
    semIva: "Valores sem IVA.",
    mrr: "Receita recorrente (MRR)",
    mrrDetalhe: (n: number) => (n === 1 ? "1 barbearia ativa" : `${n} barbearias ativas`),
    recebido: "Recebido no mês",
    custos: "Custos do mês",
    custosDetalhe: (fixos: string, variaveis: string) => `Fixos ${fixos} · variáveis ${variaveis}`,
    lucroEstimado: "Lucro estimado",
    lucroCaixa: "Lucro de caixa",
    lucrosAjuda:
      "O estimado é o MRR menos os custos do mês; o de caixa é o recebido menos as contas pagas. A diferença são as mensalidades por receber.",
    margem: "Margem",
    arpu: "Valor médio por barbearia",
    atraso: "Em atraso (com IVA)",
    atrasoDetalhe: (n: number) => (n === 1 ? "1 barbearia" : `${n} barbearias`),
    saidas: "Saídas no mês",
    saidasPoucas: "Mostra-se com mais de 10 barbearias.",
    semValor: "—",
    grafico: "Últimos 12 meses",
    graficoAjuda: "Receita recorrente de cada mês com o plano atual de cada barbearia.",
    series: { receita: "Receita", custos: "Custos", lucro: "Lucro" } as Record<string, string>,
    planos: "Distribuição por plano",
    plano: (nome: string, n: number) => `${nome}: ${n}`,
  },
  equilibrio: {
    titulo: "Ponto de equilíbrio",
    formula: "Custos fixos mensais ÷ (valor médio por barbearia − custo variável por barbearia).",
    mistura: "Mistura atual",
    misturaEscolhida: (basic: number) => `Mistura escolhida (${basic} % Basic)`,
    soBasic: "Só Basic",
    soPro: "Só Pro",
    barbearias: (n: number) => (n === 1 ? "1 barbearia" : `${n} barbearias`),
    faltam: (n: number) =>
      n <= 0 ? "Atingido." : n === 1 ? "Falta 1 barbearia." : `Faltam ${n} barbearias.`,
    naoExiste: "Com estes custos não existe: a margem por barbearia é zero ou negativa.",
    escolherMistura: "Percentagem de Basic na mistura (sem barbearias ativas)",
    previsto: (mes: string) => `Na previsão base, o lucro deixa de ser negativo em ${mes}.`,
    previstoNunca: "Na previsão base, não nos próximos 12 meses.",
    aplicar: "Aplicar",
  },
  objetivo: {
    meta: "Objetivo do mês",
    semMeta: "Ainda sem objetivo definido.",
    metaDe: (valor: string, base: string, mes: string) => `${valor} de ${base} (desde ${mes})`,
    bases: { mrr: "receita recorrente", recebido: "recebido" } as Record<string, string>,
    definir: "Definir o objetivo",
    campos: { mes: "Mês", valor: "Valor sem IVA (€)", base: "Medido sobre" },
    guardar: "Guardar objetivo",
    guardado: "Objetivo guardado.",
    falta: "Quanto falta",
    cumprido: (p: string) => `${p} cumprido`,
    atingido: "Objetivo atingido.",
    quantas: "Quantas barbearias faltam",
    soBasic: "Só Basic",
    soPro: "Só Pro",
    mistura: "Mistura atual",
    barbearias: (n: number) => (n === 1 ? "1 barbearia" : `${n} barbearias`),
    caminho: "A caminho (Comercial)",
    abertas: (n: number) =>
      n === 1 ? "1 proposta enviada em aberto" : `${n} propostas enviadas em aberto`,
    previstas: (n: number, taxa: string) =>
      `Com a conversão histórica de ${taxa}, cerca de ${n} ${n === 1 ? "fecha" : "fecham"}.`,
    semTaxa: "A taxa de conversão aparece com 10 ou mais propostas decididas.",
    quando: "Mês em que se atinge (cenário base)",
    nunca: "Não nos próximos 12 meses.",
  },
  previsao: {
    titulo: "Previsões a 12 meses",
    aviso: "Projeção com os pressupostos abaixo. Não é uma promessa.",
    novas: "Novas barbearias por mês",
    saidas: "Saídas mensais (%)",
    declarada: "Pressuposto declarado de 3 % (menos de 10 barbearias).",
    valorMedio: "Valor médio por barbearia (€)",
    cenarios: { pessimista: "Pessimista", base: "Base", otimista: "Otimista" } as Record<
      string,
      string
    >,
    equilibrio: "Ponto de equilíbrio (base)",
    meta: "Objetivo (base)",
    mrrFinal: (c: string) => `MRR daqui a 12 meses (${c})`,
    nunca: "Não nos próximos 12 meses",
    eSe: "E se tiver N barbearias Pro?",
    n: "Número de barbearias Pro",
    eSeResultado: (mrr: string, lucro: string, margem: string) =>
      `MRR ${mrr} · lucro ${lucro} · margem ${margem}`,
    custos: "Custos",
  },
  vencimentos: {
    ajuda:
      "O sistema prepara a mensagem; quem envia é o operador. O WhatsApp só fica confirmado depois de carregar em «Confirmei o envio»; o e-mail sai de apoio@ no momento.",
    vazio: "Nenhum vencimento com este filtro.",
    filtros: {
      "7": "Próximos 7 dias",
      "15": "Próximos 15 dias",
      atraso: "Em atraso",
      todos: "Todos",
    } as Record<string, string>,
    dias: (n: number) =>
      n === 0
        ? "Vence hoje"
        : n > 0
          ? n === 1
            ? "Falta 1 dia"
            : `Faltam ${n} dias`
          : n === -1
            ? "1 dia em atraso"
            : `${-n} dias em atraso`,
    valor: (v: string) => `${v} com IVA`,
    ultimo: (d: string) => `Último lembrete: ${d}`,
    nenhum: "Ainda sem lembrete para este vencimento.",
    texto: "Texto da mensagem",
    whatsapp: "WhatsApp",
    email: "E-mail",
    confirmar: "Confirmei o envio",
    repetir: "Tentar outra vez",
    cancelar: "Cancelar lembrete",
    estados: {
      preparada: "Preparado",
      ligacao_aberta: "WhatsApp aberto · por confirmar",
      envio_confirmado_manualmente: "WhatsApp confirmado",
      enviado: "E-mail enviado",
      falhou: "E-mail falhou",
      cancelada: "Cancelado",
    } as Record<string, string>,
    semWhatsapp: "Sem WhatsApp nem telefone na ficha.",
    semEmail: "Sem e-mail na ficha.",
    assunto: (barbearia: string, data: string) =>
      `InstaBarber · mensalidade de ${barbearia} (vencimento ${data})`,
    pagamento: "Pode pagar por MB WAY ou por transferência bancária.",
    modelos: {
      aviso: (nome: string, barbearia: string, plano: string, valor: string, data: string) =>
        `Olá ${nome}, um lembrete amigável: a mensalidade do InstaBarber da ${barbearia} (plano ${plano}, ${valor} com IVA) vence a ${data}.`,
      hoje: (nome: string, barbearia: string, plano: string, valor: string) =>
        `Olá ${nome}, a mensalidade do InstaBarber da ${barbearia} (plano ${plano}, ${valor} com IVA) vence hoje.`,
      atraso: (nome: string, barbearia: string, plano: string, valor: string, data: string) =>
        `Olá ${nome}, a mensalidade do InstaBarber da ${barbearia} (plano ${plano}, ${valor} com IVA) venceu a ${data} e ainda não a recebemos.`,
      atrasoPedido: (dias: number) =>
        dias <= 7
          ? "Se já pagou, ignore esta mensagem. Se não, diga-nos quando conta pagar, por favor."
          : dias <= 15
            ? "Pedimos que nos responda hoje, para combinarmos o pagamento."
            : "Sem pagamento ou resposta, o acesso à plataforma pode ser suspenso. Fale connosco, por favor.",
      obrigado: "Obrigado.",
    },
    erros: {
      sem_whatsapp: "A barbearia não tem WhatsApp nem telefone na ficha.",
      sem_email: "A barbearia não tem e-mail na ficha.",
      sem_vencimento: "A barbearia não tem vencimento definido.",
      inquilino_sem_contrato_ativo: "A barbearia não está ativa nem suspensa.",
      texto_obrigatorio: "Escreva o texto da mensagem.",
      estado_invalido: "Este lembrete já não se pode alterar.",
      abrir_primeiro: "Abra o WhatsApp primeiro.",
      generico: "Não foi possível concluir. Tente outra vez.",
    } as Record<string, string>,
  },
  alertas: {
    aVencer: (n: number) =>
      n === 1
        ? "1 conta a pagar vence nos próximos 7 dias"
        : `${n} contas a pagar vencem nos próximos 7 dias`,
    atrasadas: (n: number) =>
      n === 1 ? "1 conta a pagar atrasada" : `${n} contas a pagar atrasadas`,
  },
} as const;
