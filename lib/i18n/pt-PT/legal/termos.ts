import type { DocumentoLegal, Prestadora } from "./tipos";

// Termos de Uso do InstaBarber (H.4), revistos com o jurista (D-155). Coerentes com o modelo de
// contrato (docs/comercial/modelo-contrato.md): em caso de contrato assinado, prevalece o contrato.

export const termos = (p: Prestadora): DocumentoLegal => ({
  titulo: "Termos de Uso",
  versao: "Versão de 25 de outubro de 2026",
  introducao: [
    `Estes Termos regulam a utilização do InstaBarber, sistema de gestão para barbearias fornecido por ${p.nome}, NIF ${p.nif}, com domicílio profissional em ${p.morada}, que exerce a atividade sob a designação comercial «Performa LAB» («Performa LAB»).`,
    "A adesão ao InstaBarber depende da aceitação dos presentes Termos de Uso, da Política de Privacidade e do Acordo de Subcontratação de Dados Pessoais, nas respetivas versões disponibilizadas ao Cliente antes da contratação.",
    "Quando exista contrato escrito assinado entre a Performa LAB e o Cliente, esse contrato prevalece em caso de conflito com os presentes Termos. A proposta aceite determina o plano, as funcionalidades contratadas, a periodicidade, o preço e as condições comerciais específicas. Os presentes Termos e os respetivos anexos complementam o contrato nas matérias que não contrariem as condições especificamente acordadas.",
    "A Performa LAB conserva registo da versão dos documentos disponibilizada e aceite pelo Cliente, bem como da data e do meio de aceitação.",
  ],
  seccoes: [
    {
      titulo: "1. O Serviço",
      paragrafos: [
        "O InstaBarber é fornecido através da internet e inclui, conforme o plano contratado, agenda, clientes, equipa, financeiro, fidelização, mensagens preparadas e página pública de marcação.",
        "As funcionalidades incluídas em cada plano são as identificadas na proposta aceite ou, na adesão sem proposta, no resumo da contratação entregue ao Cliente, de acordo com a grelha de funcionalidades aplicável à data da contratação, cuja versão a Performa LAB conserva. A área «O meu plano» apresenta o plano ativo e as funcionalidades disponibilizadas ao Cliente. Qualquer alteração material das funcionalidades contratadas rege-se pela cláusula 11, sem prejuízo das atualizações técnicas que não reduzam materialmente o que foi contratado.",
        "A Plataforma não processa pagamentos nem emite documentos fiscais, e não substitui um programa de faturação certificado. Os valores nela registados são controlo interno do Cliente.",
        "As mensagens a clientes por WhatsApp são preparadas pela Plataforma e enviadas pelo próprio Cliente, a partir da sua conta, por ligação wa.me. A Performa LAB não envia essas mensagens nem cobra por elas.",
        "Só a Performa LAB ativa ou desativa funcionalidades. Funcionalidades oferecidas a título de bónus, além das contratadas, não alteram o preço e podem ser retiradas com aviso de 30 dias. Uma funcionalidade incluída na proposta aceite ou no resumo da contratação como parte do plano não é um bónus e só pode ser alterada nos termos da cláusula 11.",
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
        "Os preços dos planos são os apresentados no formulário de adesão, com e sem IVA, em periodicidade mensal ou anual. O preço final é o valor com IVA.",
        "Plano Basic: 19,99 € por mês sem IVA (24,59 € com IVA), ou 199,90 € por ano (245,88 € com IVA), com um profissional. Plano Pro: 39,00 € por mês sem IVA (47,97 € com IVA), ou 390,00 € por ano (479,70 € com IVA), com três profissionais incluídos e 10,00 € por mês (12,30 € com IVA) por cada profissional a partir do quarto. Domínio próprio, em qualquer plano: mais 5,00 € por mês (6,15 € com IVA), ou 50,00 € por ano.",
        "Os preços e as condições de pagamento aplicáveis ao Cliente são os constantes da proposta aceite ou do resumo da contratação. Nos planos anuais, o preço anual corresponde ao período de referência de 12 meses, com a redução comercial de dez mensalidades por doze meses, e paga-se antecipadamente.",
        "A denúncia e os eventuais reembolsos de valores pagos antecipadamente regem-se pela cláusula 7 e pelo contrato, não podendo esta cláusula ser interpretada como impondo o pagamento de períodos posteriores à cessação quando tal obrigação não tenha sido validamente acordada.",
        "A Performa LAB só pode alterar os preços com aviso escrito de, pelo menos, 60 dias, e a alteração não se aplica ao período já pago. Se não concordar, o Cliente pode denunciar a adesão, sem encargos, até à entrada em vigor do novo preço.",
      ],
    },
    {
      titulo: "4. Faturação, pagamento, suspensão e resolução",
      paragrafos: [
        "A Performa LAB emite a fatura no seu programa de faturação certificado e envia-a por e-mail. O preço paga-se antecipadamente, com vencimento a 15 dias da data de emissão da fatura, por MB WAY, transferência bancária ou numerário. Não há débito direto nem cobrança automática.",
        "Passados 10 dias de atraso, e depois de aviso escrito com 8 dias de antecedência, a Performa LAB pode suspender o acesso da equipa. Durante a suspensão a página pública mostra «Temporariamente indisponível para marcações», o proprietário continua a consultar o seu plano e as faturas, e nenhum dado é apagado. O Serviço é reativado com o pagamento.",
        "Passados 40 dias de atraso, e depois de novo aviso escrito com 15 dias de antecedência, a Performa LAB pode resolver a adesão ou o contrato. A suspensão ou a resolução não determina a eliminação imediata dos dados do Cliente, aplicando-se as regras de exportação, recuperação e eliminação da cláusula 7 e do Acordo de Subcontratação de Dados Pessoais.",
      ],
    },
    {
      titulo: "5. Obrigações do Cliente",
      paragrafos: ["O Cliente obriga-se a:"],
      lista: [
        "fornecer dados verdadeiros e mantê-los atualizados;",
        "usar a Plataforma de forma lícita, sem tentar aceder a dados de outros clientes da Performa LAB, copiar, desmontar ou revender o Serviço;",
        "obter o consentimento dos seus clientes antes de lhes enviar mensagens promocionais e respeitar o pedido de «não contactar»;",
        "não registar dados de saúde nem outras categorias especiais de dados pessoais, incluindo nos campos de notas;",
        "cumprir as obrigações que a lei lhe impõe como responsável pelo tratamento dos dados dos seus clientes;",
        "pagar o preço nos termos da cláusula 4.",
      ],
    },
    {
      titulo: "6. Obrigações da Performa LAB",
      paragrafos: ["A Performa LAB obriga-se a:"],
      lista: [
        "prestar o Serviço com a diligência profissional exigível e de acordo com o plano contratado;",
        "aplicar medidas técnicas e organizativas de segurança adequadas aos riscos do tratamento, incluindo controlo de acessos, isolamento dos dados dos Clientes e cópias de segurança, nos termos do Acordo de Subcontratação;",
        "prestar suporte através do endereço apoio@instabarber.pt, de segunda-feira a sábado, das 8h00 às 20h00, e, ao domingo, apenas para situações de emergência que impeçam o funcionamento essencial da Plataforma, respondendo com a brevidade razoavelmente possível; o tempo de resolução depende da natureza do problema;",
        "informar com antecedência razoável as manutenções programadas suscetíveis de interromper materialmente o Serviço;",
        "tratar os dados pessoais sob a sua responsabilidade nos termos da Política de Privacidade e os dados tratados por conta do Cliente nos termos do Acordo de Subcontratação;",
        "disponibilizar os mecanismos de exportação e recuperação dos dados previstos na cláusula 7.",
      ],
    },
    {
      titulo: "6.1. Disponibilidade",
      paragrafos: [
        "A disponibilidade do Serviço rege-se pela cláusula 9, sem prejuízo das obrigações legais de segurança, diligência e responsabilidade aplicáveis.",
      ],
    },
    {
      titulo: "7. Duração, denúncia e saída",
      paragrafos: [
        "A adesão vigora por tempo indeterminado, sem período de fidelização. Qualquer das partes a pode denunciar, sem invocar motivo e sem penalização, por comunicação escrita com 30 dias de antecedência. A denúncia produz efeitos no último dia do período de faturação em que terminar esse aviso (no plano anual, no fim do período anual pago): até essa data o Serviço mantém-se e o preço é devido; a partir dela não há mais faturação. Os valores de períodos já iniciados não são reembolsáveis, salvo alteração de preço não aceite ou incumprimento da Performa LAB.",
        "Quando a adesão terminar, o Cliente pode solicitar a exportação dos seus dados ou a sua eliminação, nos termos do contrato e do Acordo de Subcontratação. A Performa LAB disponibiliza os dados exportáveis em formato estruturado, de uso corrente e legível por máquina (CSV e, quanto aos ficheiros, nos respetivos formatos originais), sem custos.",
        "A exportação será disponibilizada sem demora injustificada e dentro dos prazos legalmente aplicáveis, tendo como prazo contratual máximo 30 dias para a entrega dos dados, sem prejuízo de prazos específicos de transição que sejam legalmente exigíveis.",
        "O Cliente dispõe de pelo menos 30 dias após a disponibilização da exportação para verificar e recolher os dados. Durante esse período, a Performa LAB não elimina os dados exportáveis, salvo pedido expresso de eliminação pelo Cliente ou obrigação legal em contrário.",
        "Concluído o período de recuperação, a Performa LAB elimina os dados da Plataforma e assegura a eliminação das cópias de segurança no prazo de 30 dias, salvo os dados cuja conservação seja legalmente obrigatória. A eliminação não prejudica os direitos de recuperação ou de transição que resultem de normas legais imperativas.",
      ],
    },
    {
      titulo: "8. Propriedade intelectual",
      paragrafos: [
        "A Plataforma, o código, a marca InstaBarber e a documentação pertencem à Performa LAB. Os dados do Cliente, a sua marca, logótipo e fotografias pertencem ao Cliente, que concede à Performa LAB a licença limitada necessária para os alojar e apresentar no Serviço e na sua página pública, e garante que tem os direitos necessários sobre esses conteúdos.",
      ],
    },
    {
      titulo: "9. Disponibilidade e responsabilidade",
      paragrafos: [
        "A Performa LAB envidará esforços comercialmente razoáveis para assegurar a disponibilidade da Plataforma, tendo como objetivo uma disponibilidade mensal de 99,5%. Este valor constitui um objetivo de serviço e não uma garantia absoluta de funcionamento ininterrupto.",
        "A disponibilidade é avaliada mensalmente, considerando o período em que as funcionalidades essenciais da Plataforma (entrada, agenda, ficha de clientes e página pública de marcação) estão acessíveis e operacionais. Excluem-se apenas as manutenções comunicadas com antecedência, as situações de força maior e as falhas de redes ou de serviços de terceiros que estejam efetivamente fora do controlo razoável da Performa LAB; as falhas imputáveis à Performa LAB não são excluídas.",
        "A Performa LAB procurará minimizar o impacto das interrupções e restabelecer o Serviço com a maior brevidade razoavelmente possível.",
        "A responsabilidade da Performa LAB é determinada pelo contrato e pela lei aplicável. Qualquer limitação contratual de responsabilidade deve ser interpretada dentro dos limites legalmente admissíveis e não exclui responsabilidades que não possam ser validamente afastadas.",
        "A Performa LAB não responde por dados inexatos introduzidos pelo Cliente, pelo conteúdo das mensagens que o Cliente decida enviar ou por falhas de terceiros que estejam efetivamente fora do seu controlo razoável, sem prejuízo das responsabilidades que legalmente lhe sejam imputáveis.",
      ],
    },
    {
      titulo: "10. Comunicações",
      paragrafos: [
        "As comunicações operacionais e os pedidos de suporte podem ser efetuados por correio eletrónico para os endereços indicados pela Performa LAB.",
        "As comunicações relativas à denúncia ou resolução, à suspensão do Serviço, à alteração de preços e a outras situações que exijam prova formal do envio e da receção devem ser efetuadas por carta registada com aviso de receção ou por correio eletrónico que permita comprovar o envio e a receção pelo destinatário, nos termos do contrato.",
        "Os contactos da Performa LAB são: apoio@instabarber.pt para suporte, comercial@instabarber.pt para contratação e preços e privacidade@instabarber.pt para questões de proteção de dados. O contacto do Cliente é o indicado na adesão ou no contrato, conforme aplicável.",
        "Cada parte deve comunicar por escrito qualquer alteração dos seus contactos. A eficácia das comunicações depende das regras legais aplicáveis e das disposições do contrato.",
      ],
    },
    {
      titulo: "11. Alterações aos Termos",
      paragrafos: [
        "A Performa LAB pode atualizar os presentes Termos quando tal seja necessário por motivos legais, regulamentares, de segurança ou de evolução do Serviço, respeitando o contrato e os direitos do Cliente.",
        "As alterações que reduzam materialmente as funcionalidades contratadas ou modifiquem de forma relevante as condições comerciais serão comunicadas por escrito com uma antecedência mínima de 60 dias, salvo prazo diferente legalmente exigível. Nesses casos, o Cliente pode denunciar a adesão sem encargos até à data de entrada em vigor da alteração.",
        "As alterações não modificam retroativamente as condições de períodos já pagos nem substituem uma alteração contratual que exija o acordo das partes.",
        "A versão em vigor é publicada nesta página, com indicação da data de entrada em vigor. A Performa LAB conserva as versões anteriores e o respetivo histórico de alterações.",
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
