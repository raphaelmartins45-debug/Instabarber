// Apoio às vendas (D-181): a demonstração e as ferramentas que o comercial usa na conversa
// e na visita. Os valores chegam formatados por lib/formatacao; aqui não há preços.

const assinatura = "Comercial InstaBarber";

export const vendas = {
  titulo: "Apoio às vendas",
  ajuda:
    "Tudo o que ajuda a vender: a demonstração, as contas com os números da barbearia, as respostas às objeções, o guião da visita e as mensagens prontas.",
  demonstracaoSoAdmin:
    "A barbearia de demonstração abre-se na vista de apoio, que é só do dono e do gestor da plataforma. Peça-lhes uma demonstração conjunta.",
  copiar: "Copiar",
  copiado: "Copiado.",
  whatsapp: "Abrir no WhatsApp",
  simulador: {
    titulo: "Simulador de preço",
    ajuda: "O preço certo para o plano e o número de barbeiros, pela mesma fórmula da adesão.",
    plano: "Plano",
    planos: { basic: "Basic", pro: "Pro" },
    barbeiros: "Barbeiros",
    barbeirosAjuda: "O Basic tem 1; o Pro inclui 3 e cada um a mais acresce à mensalidade.",
    dominio: "Domínio próprio",
    mensal: "Por mês",
    anual: "Por ano",
    poupa: (valor: string) => `Pagando o ano, poupa ${valor} (dois meses).`,
    iva: { isento: "Ao preço não acresce IVA.", normal: "IVA incluído." },
    texto: (
      plano: string,
      barbeiros: number,
      mensal: string,
      anual: string,
      poupa: string,
      iva: string,
    ) =>
      `InstaBarber ${plano} para ${barbeiros} ${barbeiros === 1 ? "barbeiro" : "barbeiros"}: ${mensal} por mês, ou ${anual} por ano (poupa ${poupa}). ${iva} Sem pagar por mensagem nem por marcação. ${assinatura}`,
  },
  perdas: {
    titulo: "Quanto está a perder",
    ajuda:
      "Faça a conta com os números do barbeiro, à frente dele. É uma estimativa para a conversa, nunca uma promessa.",
    faltas: "Faltas por semana",
    visita: "Valor médio da visita (€)",
    perdidos: "Clientes que deixaram de vir",
    perdidosAjuda: "Uma estimativa dele: quantos clientes habituais deixou de ver.",
    plano: "Comparar com o plano",
    faltasMes: (valor: string) => `As faltas custam cerca de ${valor} por mês.`,
    recuperavel: (valor: string) =>
      `Os clientes que deixaram de vir podem valer ${valor} (se 4 em cada 10 voltarem com um lembrete).`,
    cortes: (n: number, mensal: string) =>
      `A mensalidade (${mensal}) paga-se com ${n} ${n === 1 ? "corte" : "cortes"} por mês.`,
    vazio: "Preencha o valor da visita para ver a conta.",
    texto: (linhas: string[]) => `${linhas.join(" ")} ${assinatura}`,
  },
  objecoes: {
    titulo: "Respostas às objeções",
    ajuda: "As objeções mais comuns e uma resposta curta. Adapte ao barbeiro com quem fala.",
    lista: [
      {
        id: "caro",
        objecao: "«É caro.»",
        resposta:
          "Percebo. Vamos fazer a conta com os seus números: com o valor de um corte e as faltas que tem por semana, a mensalidade paga-se com poucos cortes. E não paga por mensagem nem por marcação: os lembretes vão pelo seu WhatsApp.",
      },
      {
        id: "papel",
        objecao: "«Já tenho a agenda no papel (ou no telemóvel).»",
        resposta:
          "O papel não avisa o cliente nem lhe diz quem deixou de aparecer. Aqui o cliente marca sozinho a qualquer hora, recebe o lembrete por WhatsApp e o senhor vê na ficha quem já não vem há muito tempo.",
      },
      {
        id: "online",
        objecao: "«Os meus clientes não marcam online.»",
        resposta:
          "Não precisam: quem liga ou manda mensagem continua a fazê-lo e o senhor marca ao balcão em segundos. Quem prefere marcar à noite, com a barbearia fechada, passa a poder.",
      },
      {
        id: "tempo",
        objecao: "«Não tenho tempo para aprender um sistema.»",
        resposta:
          "Configuramos consigo no primeiro dia, numa sessão de cerca de uma hora, e acompanhamos nos primeiros dias. Funciona no telemóvel, como uma aplicação.",
      },
      {
        id: "outro",
        objecao: "«Já uso outro sistema.»",
        resposta:
          "Quando acaba o contrato? Combinamos uma demonstração antes de renovar e mostro-lhe o que muda: aqui tem a página da barbearia, a agenda, os clientes, as comissões e o relatório do mês num só sistema.",
      },
      {
        id: "dados",
        objecao: "«E os meus dados? E se eu sair?»",
        resposta:
          "Os dados ficam em servidores na União Europeia, separados dos de outras barbearias, com cópias de segurança. São seus: se sair, pode pedir a exportação.",
      },
      {
        id: "pensar",
        objecao: "«Vou pensar.»",
        resposta:
          "Claro. Deixo-lhe a proposta por escrito, com a validade indicada. Posso ligar-lhe num dia à sua escolha para tirar as dúvidas que surgirem?",
      },
    ],
  },
  guiao: {
    titulo: "Guião da visita",
    ajuda: "A visita em sete passos. No fim, o lead fica com a próxima ação e a data.",
    passos: [
      {
        titulo: "Antes de ir",
        texto:
          "Veja o Instagram e o Google da barbearia (avaliações, horário, preços). Crie o lead com a ficha de prospeção.",
      },
      {
        titulo: "Abrir a conversa",
        texto:
          "Pergunte como marcam hoje, quantos barbeiros são e quantas faltas têm por semana. Ouça mais do que fala.",
      },
      {
        titulo: "Encontrar as dores",
        texto:
          "Faltas, clientes que deixaram de vir, agenda em papel, contas dos barbeiros no fim do mês. Anote as que ele disser.",
      },
      {
        titulo: "Mostrar a demonstração",
        texto:
          "Em 10 a 15 minutos: a página da barbearia, uma marcação, a agenda, o lembrete por WhatsApp, a ficha do cliente e o relatório do mês. Mostre só o que responde às dores dele.",
      },
      {
        titulo: "Fazer a conta",
        texto:
          "Use «Quanto está a perder» com os números dele. Deixe-o dizer os números; a conta é dele.",
      },
      {
        titulo: "Falar do preço",
        texto:
          "Use o simulador: o plano certo para o número de barbeiros, mensal ou anual. Responda às objeções sem pressa.",
      },
      {
        titulo: "Fechar o próximo passo",
        texto:
          "Preencha o briefing e gere a proposta no mesmo dia. Antes de sair, combine a próxima ação com data e registe-a no lead.",
      },
    ],
    novoLead: "Criar um lead",
  },
  mensagens: {
    titulo: "Mensagens prontas",
    ajuda:
      "Para qualquer conversa, mesmo sem lead criado: escreva o nome, abra o WhatsApp e escolha o contacto. Na ficha do lead, as mensagens ficam no histórico.",
    nome: "Nome do contacto",
    nomeVazio: "[nome]",
    modelos: {
      primeiro: "Primeiro contacto",
      seguimento: "Seguimento",
      posDemonstracao: "Depois da demonstração",
      envioProposta: "Envio da proposta",
      fimContrato: "Fim do contrato atual",
      aposAssinatura: "Depois da assinatura",
    } as Record<string, string>,
    textos: {
      posDemonstracao: (nome: string) =>
        `Olá ${nome}! Obrigado pelo tempo de hoje. Como viu, a agenda, os lembretes e os clientes ficam todos num só sistema. Quer que lhe prepare a proposta para a sua barbearia? ${assinatura}`,
      envioProposta: (nome: string) =>
        `Olá ${nome}! Segue a proposta da InstaBarber para a sua barbearia, com o plano que falámos. Qualquer dúvida, diga-me; posso explicar ponto a ponto. ${assinatura}`,
      aposAssinatura: (nome: string) =>
        `Olá ${nome}! Bem-vindo à InstaBarber. O próximo passo é o formulário de adesão, com o logótipo e os dados da barbearia; depois disso, a sua página fica no ar e combinamos a sessão de arranque. ${assinatura}`,
    },
  },
} as const;
