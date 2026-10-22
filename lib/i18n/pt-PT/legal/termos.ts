import type { DocumentoLegal, Prestadora } from "./tipos";

// Termos de Uso do InstaBarber (H.4). Coerentes com o modelo de contrato (docs/comercial/modelo-contrato.md):
// em caso de contrato assinado, prevalece o contrato.

export const termos = (p: Prestadora): DocumentoLegal => ({
  titulo: "Termos de Uso",
  versao: "Versão de 22 de outubro de 2026",
  introducao: [
    `Estes Termos regulam a utilização do InstaBarber, o sistema de gestão para barbearias fornecido por ${p.nome}, NIF ${p.nif}, com domicílio profissional em ${p.morada}, que atua sob a designação comercial «Performa LAB» («Performa LAB»).`,
    "Ao submeter o formulário de adesão e ao utilizar a Plataforma, a barbearia («Cliente») aceita estes Termos, a Política de Privacidade e o Acordo de Subcontratação. Se tiver assinado um contrato com a Performa LAB, o contrato prevalece sobre estes Termos naquilo em que forem diferentes.",
  ],
  seccoes: [
    {
      titulo: "1. O Serviço",
      paragrafos: [
        "O InstaBarber é fornecido através da internet e inclui, conforme o plano contratado, agenda, clientes, equipa, financeiro, fidelização, mensagens preparadas e página pública de marcação. O que cada plano inclui está na grelha de funcionalidades apresentada no formulário de adesão e em «O meu plano».",
        "A Plataforma não processa pagamentos nem emite documentos fiscais, e não substitui um programa de faturação certificado. Os valores nela registados são controlo interno do Cliente.",
        "As mensagens a clientes por WhatsApp são preparadas pela Plataforma e enviadas pelo próprio Cliente, a partir da sua conta, por ligação wa.me. A Performa LAB não envia essas mensagens nem cobra por elas.",
        "Só a Performa LAB ativa ou desativa funcionalidades. Funcionalidades oferecidas a título de bónus não alteram o preço e podem ser retiradas com aviso de 30 dias.",
      ],
    },
    {
      titulo: "2. Adesão e contas",
      paragrafos: [
        "A adesão faz-se pelo formulário próprio. O pedido é revisto pela Performa LAB, que o pode aprovar, ajustar com o Cliente ou recusar com indicação do motivo. A conta do proprietário é criada na aprovação e a palavra-passe é definida pelo próprio, através de uma ligação segura enviada por e-mail. A Performa LAB nunca pede palavras-passe.",
        "As credenciais são pessoais e intransmissíveis. O Cliente responde pela guarda e pelo uso que os seus utilizadores fizerem delas e avisa a Performa LAB, sem demora, de qualquer uso indevido de que tenha conhecimento.",
        "O Cliente não pode ter mais profissionais ativos do que os contratados. Para os aumentar, ou para mudar de plano ou de periodicidade, pede-o por escrito; a alteração reflete-se na mensalidade a partir da data acordada.",
      ],
    },
    {
      titulo: "3. Preços",
      paragrafos: [
        "Os preços dos planos são os apresentados no formulário de adesão, com e sem IVA, em periodicidade mensal ou anual (o plano anual corresponde a dez mensalidades). O preço final é o valor com IVA.",
        "Plano Basic: 19,99 € por mês sem IVA (24,59 € com IVA), ou 199,90 € por ano (245,88 € com IVA), com um profissional. Plano Pro: 39,00 € por mês sem IVA (47,97 € com IVA), ou 390,00 € por ano (479,70 € com IVA), com três profissionais incluídos e 10,00 € por mês (12,30 € com IVA) por cada profissional a partir do quarto. Domínio próprio, em qualquer plano: mais 5,00 € por mês (6,15 € com IVA), ou 50,00 € por ano.",
        "A Performa LAB só pode alterar os preços com aviso escrito de, pelo menos, 60 dias, e a alteração não se aplica ao período já pago. Se não concordar, o Cliente pode cancelar, sem encargos, até à entrada em vigor do novo preço.",
      ],
    },
    {
      titulo: "4. Faturação e pagamento",
      paragrafos: [
        "A Performa LAB emite a fatura no seu programa de faturação certificado e envia-a por e-mail. A mensalidade paga-se antecipadamente, até à data de vencimento indicada na fatura, por MB WAY, transferência bancária ou numerário. Não há débito direto nem cobrança automática.",
        "Em caso de atraso superior a 30 dias, e depois de aviso escrito com 8 dias, a Performa LAB pode suspender o acesso da equipa. Durante a suspensão a página pública mostra «Temporariamente indisponível para marcações», o proprietário continua a consultar o seu plano e as faturas, e nenhum dado é apagado. O Serviço é reativado com o pagamento.",
      ],
    },
    {
      titulo: "5. Obrigações do Cliente",
      paragrafos: ["O Cliente obriga-se a:"],
      lista: [
        "fornecer dados verdadeiros e mantê-los atualizados;",
        "usar a Plataforma de forma lícita, sem tentar aceder a dados de outros clientes da Performa LAB, copiar, desmontar ou revender o Serviço;",
        "obter o consentimento dos seus clientes antes de lhes enviar mensagens promocionais e respeitar o pedido de «não contactar»;",
        "não registar dados de saúde nem outras categorias especiais de dados pessoais;",
        "cumprir as obrigações que a lei lhe impõe como responsável pelo tratamento dos dados dos seus clientes;",
        "pagar a mensalidade nos termos da cláusula 4.",
      ],
    },
    {
      titulo: "6. Obrigações da Performa LAB",
      paragrafos: [
        "A Performa LAB presta o Serviço com a diligência profissional exigível, mantém medidas de segurança adequadas (isolamento dos dados de cada cliente, alojamento na União Europeia e cópias de segurança com 30 dias de retenção), dá suporte pelo endereço apoio@instabarber.pt em dias úteis, avisa com antecedência razoável as manutenções que possam interromper o Serviço e trata os dados pessoais nos termos do Acordo de Subcontratação.",
      ],
    },
    {
      titulo: "7. Duração, cancelamento e saída",
      paragrafos: [
        "A adesão vigora por tempo indeterminado, sem período de fidelização. Qualquer das partes a pode cancelar, sem invocar motivo e sem penalização, por comunicação escrita com 30 dias de antecedência; o cancelamento produz efeitos no fim do período de faturação em curso. As mensalidades de períodos já iniciados não são reembolsáveis, salvo alteração de preço não aceite ou incumprimento da Performa LAB.",
        "Quando a adesão termina, a Performa LAB entrega ao Cliente, sem custos, todos os seus dados em formato estruturado e legível por máquina (CSV e, para ficheiros, os formatos originais), no prazo máximo de 30 dias. O Cliente dispõe de, pelo menos, 30 dias após a entrega para verificar e recolher os dados; terminado esse prazo, a Performa LAB elimina-os, e as cópias de segurança extinguem-se em 30 dias.",
      ],
    },
    {
      titulo: "8. Propriedade intelectual",
      paragrafos: [
        "A Plataforma, o código, a marca InstaBarber e a documentação pertencem à Performa LAB. Os dados do Cliente, a sua marca, logótipo e fotografias pertencem ao Cliente, que concede à Performa LAB a licença limitada necessária para os alojar e apresentar no Serviço e na sua página pública, e garante que tem os direitos necessários sobre esses conteúdos.",
      ],
    },
    {
      titulo: "9. Responsabilidade",
      paragrafos: [
        "A Performa LAB presta o Serviço com os meios razoáveis ao seu alcance, mas não garante que funcione sem interrupções ou erros. Responde sem limite pelos danos que cause por dolo ou culpa grave e por danos à vida, à integridade física ou à saúde. Nos restantes casos, a sua responsabilidade limita-se ao valor das mensalidades pagas nos 12 meses anteriores ao facto e não abrange lucros cessantes nem danos indiretos.",
        "A Performa LAB não responde por dados inexatos introduzidos pelo Cliente, pelo uso indevido de credenciais por quem as detenha, pelas mensagens que o Cliente envie e pelo seu conteúdo, nem por falhas de redes, do WhatsApp ou de outros serviços fora do seu controlo.",
      ],
    },
    {
      titulo: "10. Comunicações",
      paragrafos: [
        "As comunicações fazem-se por escrito e por correio eletrónico: apoio@instabarber.pt (suporte e pedidos), comercial@instabarber.pt (contratação e preços) e privacidade@instabarber.pt (proteção de dados). Do lado do Cliente, vale o e-mail indicado na adesão.",
      ],
    },
    {
      titulo: "11. Alterações aos Termos",
      paragrafos: [
        "A Performa LAB pode atualizar estes Termos. Se uma alteração reduzir de forma material o que foi contratado, avisa o Cliente com 60 dias de antecedência e o Cliente pode cancelar sem encargos. A versão em vigor está sempre publicada nesta página, com a data.",
      ],
    },
    {
      titulo: "12. Lei aplicável e litígios",
      paragrafos: [
        "Estes Termos regem-se pela lei portuguesa. As partes tentam resolver qualquer litígio de boa-fé e por acordo, no prazo de 30 dias, antes de recorrerem aos tribunais portugueses competentes nos termos da lei.",
      ],
    },
  ],
});
