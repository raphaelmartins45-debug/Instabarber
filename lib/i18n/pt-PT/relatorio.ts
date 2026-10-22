// Relatório mensal (E.5): os nove blocos, no ecrã e no PDF.

export const relatorio = {
  titulo: "Relatório",
  tituloProfissional: "O meu relatório",
  mesAnterior: "Mês anterior",
  mesSeguinte: "Mês seguinte",
  exibir: "Exibir relatório",
  descarregar: "Descarregar relatório",
  vazio: "—",
  blocos: {
    resumo: "Resumo do mês",
    evolucao: "Evolução da faturação",
    desempenho: "Desempenho por profissional",
    meuDesempenho: "O meu desempenho",
    servicos: "Serviços",
    retencao: "Retenção de clientes",
    fidelizacao: "Fidelização",
    financeiro: "Financeiro",
    operacao: "Operação",
    recomendacoes: "O que fazer no próximo mês",
  },
  resumo: {
    faturacao: "Faturação",
    variacao: (v: string) => `${v} % face ao mês anterior`,
    semVariacao: "Sem mês anterior para comparar",
    resultado: "Resultado",
    margem: "Margem",
    atendidos: "Clientes atendidos",
    perdidos: "Clientes perdidos",
    recuperados: "Clientes recuperados",
  },
  colunas: {
    profissional: "Profissional",
    faturacao: "Faturação",
    servicos: "Serviços",
    ticket: "Ticket médio",
    objetivo: "Objetivo",
    comissao: "Comissão",
    servico: "Serviço",
    quantidade: "Quantidade",
    receita: "Receita",
    peso: "Peso",
  },
  retencao: {
    recuperados: "Recuperados",
    ligacoes: "Ligações abertas",
    novos: "Clientes novos",
    ativos: "Ativos",
    emRisco: "Em risco",
    pagouTitulo: "O sistema pagou-se sozinho",
    recuperou: (valor: string) => `Recuperou ${valor} em clientes que não voltavam.`,
    custou: (valor: string) =>
      `A subscrição do sistema custou ${valor} (com IVA) no mesmo período.`,
    sozinhos: (n: number) =>
      n === 1 ? "1 cliente voltou sozinho este mês." : `${n} clientes voltaram sozinhos este mês.`,
  },
  fidelizacao: {
    selos: "Selos atribuídos",
    cartoes: "Cartões completos",
    premios: "Prémios resgatados",
    convites: "Convites",
  },
  financeiro: {
    receitaPropria: "Receita própria (modelo A)",
    rendas: "Rendas de cadeira (modelo C)",
    parteCasa: "Parte da casa recebida (modelo B)",
    comissoes: "Comissões pagas",
    custos: "Custos fixos",
    despesas: "Despesas",
    receita: "Receita da barbearia",
    resultado: "Resultado",
    margem: "Margem",
    clube: "Clube",
    mensalidades: "Mensalidades recebidas",
    subscritores: "Subscritores",
    creditos: "Créditos por usar",
    loja: "Loja",
    lojaReceita: "Receita sem IVA",
    lojaCusto: "Custo",
    lojaMargem: "Margem",
    abaixoMinimo: "Produtos abaixo do mínimo",
  },
  operacao: {
    faltas: "Taxa de faltas",
    ocupacao: "Ocupação média",
    melhorDia: "Melhor dia",
    piorDia: "Pior dia",
    antecedencia: "Antecedência média",
    dias: (n: string) => `${n} dias`,
  },
  recomendacoes: {
    vazio: "Este mês não há nada a apontar. Continue assim.",
    campanha: (n: number, valor: string) =>
      `Tem ${n} clientes perdidos. Uma campanha de recuperação pode trazer cerca de ${valor}.`,
    preco: (dia: string, ocupacao: number, valor: string) =>
      `${dia} ficou com ${ocupacao} % de ocupação. Um preço por período nesse dia pode render cerca de ${valor} a mais.`,
    combinacao: (servicos: string, ticket: string, anterior: string) =>
      `O ticket médio desceu de ${anterior} para ${ticket}. Sugira a combinação mais procurada: ${servicos}.`,
    premios: (n: number) =>
      n === 1
        ? "1 cartão de selos completo por resgatar: um prémio por usar é uma visita garantida."
        : `${n} cartões de selos completos por resgatar: um prémio por usar é uma visita garantida.`,
    objetivo: (percentagem: number, valor: string, dias: number) =>
      `Está a ${percentagem} % do objetivo. Faltam ${valor} por dia nos ${dias} dias que restam.`,
  },
  pdf: {
    marca: "Performa LAB",
    de: (nome: string) => `Relatório de ${nome}`,
    pagina: (n: number, total: number) => `Página ${n} de ${total}`,
  },
  rodape: "Relatório de gestão. Não é documento fiscal.",
} as const;
