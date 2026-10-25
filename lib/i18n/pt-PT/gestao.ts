// Gestão do negócio (D-145, D-159): saúde das barbearias, arranque das novas e crescimento.

export const gestao = {
  saude: {
    titulo: "Saúde das barbearias",
    ajuda:
      "Sinais de risco de cancelar e o arranque das barbearias novas, calculados com o que já está registado. Servem para contactar a tempo, não são previsões.",
    niveis: { risco: "Em risco", atencao: "Atenção", bom: "Bem" } as Record<string, string>,
    motivos: {
      atraso: "Mensalidade em atraso",
      suspensa: "Barbearia suspensa",
      semMarcacoes: "Mais de 14 dias sem marcações",
      quedaMarcacoes: "Marcações dos últimos 30 dias caíram para metade",
      arranqueLento: "Arranque abaixo de 50 % depois de 30 dias",
    } as Record<string, string>,
    contagem: (risco: number, atencao: number) => `${risco} em risco · ${atencao} com atenção`,
    vazio: "Nenhuma barbearia ativa ainda.",
    semMotivos: "Sem sinais de risco.",
    abrir: "Abrir a ficha",
    colunas: {
      barbearia: "Barbearia",
      nivel: "Estado",
      motivos: "Sinais",
      marcacoes: "Marcações (30 dias)",
      arranque: "Arranque",
    },
    marcacoes: (agora: number, antes: number) => `${agora} (antes: ${antes})`,
  },
  arranque: {
    titulo: "Arranque das barbearias novas",
    ajuda: "Barbearias aprovadas há menos de 60 dias ou com o arranque por concluir.",
    vazio: "Nenhuma barbearia em arranque.",
    percentagem: (p: number) => `${p} % concluído`,
    passos: {
      logotipo: "Logótipo",
      servicos: "Serviços",
      equipa: "Equipa registada",
      acessos: "Equipa com acesso",
      clientes: "Clientes",
      primeiraMarcacao: "Primeira marcação",
      marcacaoOnline: "Primeira marcação online",
      primeiroConcluido: "Primeiro serviço concluído",
    } as Record<string, string>,
    falta: "Falta:",
    completo: "Arranque completo.",
  },
  metricas: {
    titulo: "Crescimento",
    ajuda:
      "Barbearias novas, saídas e ativas nos últimos 12 meses, com a origem e a conversão dos leads.",
    ativas: "Barbearias ativas",
    novas12: "Novas (12 meses)",
    saidas12: "Saídas (12 meses)",
    saidasMedias: "Saídas mensais médias",
    poucas: "Mostra-se com mais de 10 barbearias.",
    tempo: "Tempo médio como cliente",
    tempoValor: (m: number) => `${m} ${m === 1 ? "mês" : "meses"}`,
    tempoSairam: (m: number) => `Das que saíram: ${m} ${m === 1 ? "mês" : "meses"}`,
    semValor: "—",
    grafico: "Novas, saídas e ativas por mês",
    series: { novas: "Novas", saidas: "Saídas", ativasFim: "Ativas no fim do mês" } as Record<
      string,
      string
    >,
    origens: "De onde vieram",
    semOrigens: "Ainda nenhuma barbearia aprovada.",
    origemDireta: "Adesão direta (sem lead)",
    conversao: "Conversão dos leads",
    conversaoValor: (g: number, p: number, a: number) =>
      `${g} ganhos · ${p} perdidos · ${a} em aberto`,
    conversaoTaxa: (t: string) => `Taxa de conversão: ${t}`,
    conversaoPoucos: "A taxa mostra-se com 10 ou mais leads decididos.",
  },
} as const;
