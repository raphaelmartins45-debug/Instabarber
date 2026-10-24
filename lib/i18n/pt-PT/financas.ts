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
    aplicar: "Aplicar",
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
