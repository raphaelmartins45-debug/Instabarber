import type { DocumentoLegal, Prestadora } from "./tipos";

// Acordo de Subcontratação (art. 28.º do RGPD), aceite na adesão e revisto com o jurista (D-155).
// Mesmo conteúdo do Anexo III do contrato (docs/comercial/modelo-acordo-subcontratacao.md).

export const subcontratacao = (p: Prestadora): DocumentoLegal => ({
  titulo: "Acordo de Subcontratação",
  versao: "Versão de 25 de outubro de 2026",
  introducao: [
    "Responsável pelo tratamento: a barbearia que adere ao InstaBarber («Cliente»), identificada no pedido de adesão ou no contrato.",
    `Subcontratante: ${p.nome}, NIF ${p.nif}, com domicílio profissional em ${p.morada}, que exerce a atividade sob a designação comercial «Performa LAB» («Performa LAB»).`,
    "Este acordo cumpre o artigo 28.º do Regulamento (UE) 2016/679 (RGPD) e faz parte da adesão ao InstaBarber.",
  ],
  seccoes: [
    {
      titulo: "1. Objeto, natureza e duração",
      paragrafos: [
        "A Performa LAB trata dados pessoais por conta do Cliente para disponibilizar e manter o serviço InstaBarber, incluindo a gestão de agenda, clientes, equipa, serviços, registos financeiros internos, fidelização, mensagens registadas e página pública de marcação, de acordo com o plano contratado.",
        "O tratamento pode incluir a recolha, registo, organização, consulta, utilização, conservação, exportação, retificação, eliminação e outras operações tecnicamente necessárias à prestação do Serviço, sempre de acordo com as instruções documentadas do Cliente e com o presente Acordo.",
        "O tratamento inicia-se com a disponibilização do Serviço ao Cliente e mantém-se durante a vigência da relação contratual, terminando nos termos da cláusula 9, sem prejuízo das obrigações legais de conservação e das disposições que devam subsistir após a cessação.",
      ],
    },
    {
      titulo: "2. Tipos de dados e titulares",
      paragrafos: [
        "Os titulares dos dados são os clientes finais da barbearia, os profissionais que nela trabalham e os restantes utilizadores autorizados pelo Cliente.",
        "Os dados tratados podem incluir nome, telefone, endereço eletrónico, NIF quando facultado, data de nascimento quando facultada, marcações, histórico de visitas, serviços registados, preferências relacionadas com os serviços, notas operacionais, dados relativos à fidelização, consentimentos, mensagens registadas e registos de acesso.",
        "Os dados de autenticação são tratados segundo as medidas de segurança implementadas na Plataforma, não sendo as palavras-passe disponibilizadas em texto legível aos administradores.",
        "O Cliente não deve introduzir dados pessoais de categorias especiais, incluindo dados de saúde, nem utilizar os campos de notas para registar informações dessa natureza. A Plataforma indica junto desses campos que não se destinam a dados de saúde; a Performa LAB não garante a deteção automática desses dados.",
      ],
    },
    {
      titulo: "3. Instruções",
      paragrafos: [
        "A Performa LAB trata os dados pessoais exclusivamente segundo as instruções documentadas do Cliente, constantes do contrato, do presente Acordo e das operações que o Cliente execute através da Plataforma, incluindo as instruções relativas à exportação, alteração ou eliminação dos dados.",
        "Se considerar que uma instrução viola o RGPD ou outras disposições aplicáveis em matéria de proteção de dados, a Performa LAB informa o Cliente sem demora injustificada e pode suspender a execução da instrução em causa até que seja esclarecida, sem prejuízo das obrigações legais aplicáveis.",
        "A Performa LAB não utiliza os dados tratados por conta do Cliente para finalidades próprias incompatíveis com o presente Acordo.",
      ],
    },
    {
      titulo: "4. Confidencialidade",
      paragrafos: [
        "As pessoas autorizadas a tratar os dados estão sujeitas a dever de confidencialidade. O acesso da Performa LAB aos dados é limitado ao necessário, só através de contas pessoais com autenticação de dois fatores, e as consultas de suporte ficam registadas, com justificação.",
        "O dever de confidencialidade mantém-se após o termo das funções, da autorização de acesso ou da relação contratual, enquanto a informação em causa conservar natureza confidencial ou estiver sujeita a dever legal de sigilo.",
      ],
    },
    {
      titulo: "5. Segurança",
      paragrafos: [
        "A Performa LAB aplica medidas técnicas e organizativas adequadas ao risco, tendo em conta a natureza dos dados, o contexto do tratamento, os riscos para os titulares e os meios técnicos disponíveis.",
        "As medidas incluem, de acordo com a arquitetura efetivamente implementada:",
      ],
      lista: [
        "controlo de acessos e atribuição de permissões segundo o princípio do menor privilégio;",
        "separação lógica dos dados dos diferentes Clientes;",
        "cifragem das comunicações em trânsito;",
        "autenticação reforçada para acessos administrativos;",
        "registo e análise de ações relevantes para a segurança;",
        "cópias de segurança e procedimentos de recuperação;",
        "revisão periódica das medidas de segurança e dos acessos autorizados.",
      ],
    },
    {
      titulo: "5.1. Eficácia das medidas",
      paragrafos: [
        "A Performa LAB mantém procedimentos adequados para testar a eficácia das medidas e restabelecer a disponibilidade e o acesso aos dados em caso de incidente técnico ou físico. A descrição das medidas corresponde à implementação efetiva e é atualizada quando ocorram alterações relevantes.",
      ],
    },
    {
      titulo: "6. Subcontratantes ulteriores",
      paragrafos: [
        "O Cliente dá autorização geral para a Performa LAB recorrer aos seguintes subcontratantes ulteriores, sujeitos às mesmas obrigações deste acordo:",
      ],
      lista: [
        "Supabase — base de dados, autenticação e ficheiros — União Europeia;",
        "Vercel — alojamento da aplicação — União Europeia;",
        "Resend — envio de e-mails transacionais — União Europeia;",
        "Zoho — correio eletrónico da Performa LAB — centro de dados europeu.",
      ],
    },
    {
      titulo: "6.1. Alterações à lista",
      paragrafos: [
        "A Performa LAB avisa o Cliente, por escrito, com 30 dias de antecedência de qualquer acréscimo ou substituição. O Cliente pode opor-se por motivo fundado; se não houver alternativa, qualquer parte pode terminar a adesão sem encargos. A Performa LAB responde perante o Cliente pelo cumprimento dos subcontratantes ulteriores.",
        "O aviso é enviado por correio eletrónico para o contacto contratual do Cliente e identifica o subcontratante a adicionar ou substituir, a função prevista e a data estimada de entrada em operação. O Cliente pode apresentar oposição fundamentada dentro do prazo indicado no aviso, nos termos do presente Acordo.",
      ],
    },
    {
      titulo: "6.2. Informação sobre os subcontratantes",
      paragrafos: [
        "Para cada subcontratante ulterior, a Performa LAB mantém informação atualizada sobre a entidade prestadora, a função desempenhada, as categorias de dados tratados e a localização relevante do tratamento, incluindo eventuais transferências internacionais abrangidas pelo RGPD.",
        "A Performa LAB disponibiliza ao Cliente a informação necessária para compreender a intervenção dos subcontratantes ulteriores e para exercer os direitos previstos na cláusula 6.1.",
      ],
    },
    {
      titulo: "7. Direitos dos titulares",
      paragrafos: [
        "A Performa LAB presta ao Cliente assistência técnica e organizativa razoável, tendo em conta a natureza do tratamento, para que este possa responder aos pedidos de exercício dos direitos dos titulares previstos no RGPD.",
        "Se receber diretamente um pedido relativo aos dados tratados por conta do Cliente, a Performa LAB reencaminha-o para o Cliente sem demora injustificada e, em regra, no prazo máximo de dois dias úteis, sem responder ao pedido em nome do Cliente, salvo instrução documentada ou obrigação legal em contrário.",
        "A Plataforma disponibiliza as funcionalidades de exportação, retificação e anonimização dos dados de um cliente final que estão efetivamente implementadas. A anonimização substitui os dados identificativos de forma irreversível e não se confunde com a simples ocultação de identificadores visíveis.",
      ],
    },
    {
      titulo: "8. Violação de dados pessoais",
      paragrafos: [
        "A Performa LAB notifica o Cliente de qualquer violação de dados pessoais de que tenha conhecimento e que afete dados tratados por conta deste, sem demora injustificada e, sempre que possível, no prazo máximo de 24 horas após ter conhecimento do incidente.",
        "A notificação inclui, na medida da informação disponível, a natureza da violação, as categorias e o número aproximado de titulares e registos afetados, as consequências prováveis, as medidas já adotadas e as medidas propostas para conter e corrigir o incidente.",
        "Quando não seja possível disponibilizar toda a informação na primeira comunicação, a Performa LAB fornece-a progressivamente, sem demora injustificada.",
        "A Performa LAB presta assistência razoável ao Cliente para este avaliar a necessidade de notificação à autoridade de controlo ou aos titulares e cumprir as obrigações legais aplicáveis, incluindo as relativas à segurança do tratamento, avaliações de impacto e consultas prévias.",
      ],
    },
    {
      titulo: "9. Termo do tratamento",
      paragrafos: [
        "Após a cessação do contrato, a Performa LAB, segundo a opção documentada do Cliente, devolve os dados pessoais tratados por sua conta ou procede à sua eliminação, salvo se a conservação for exigida pelo direito da União ou do Estado-Membro aplicável.",
        "Quando o Cliente optar pela devolução, a Performa LAB disponibiliza os dados exportáveis em formato estruturado e legível por máquina, sem demora injustificada e dentro do prazo máximo contratual de 30 dias, sem prejuízo de prazos de transição diferentes que sejam legalmente exigíveis.",
        "O Cliente dispõe de pelo menos 30 dias após a disponibilização da exportação para verificar e recolher os dados. Terminado esse período, a Performa LAB elimina os dados remanescentes da Plataforma e assegura a eliminação das cópias de segurança no prazo máximo de 30 dias, salvo obrigação legal de conservação.",
        "Quando a eliminação não possa ser imediata por razões técnicas devidamente justificadas, os dados ficam protegidos, deixam de ser utilizados para as finalidades do Serviço e são eliminados assim que cesse o impedimento.",
        "A Performa LAB confirma por escrito a devolução ou eliminação, a pedido do Cliente, sem prejuízo da conservação legalmente obrigatória.",
      ],
    },
    {
      titulo: "10. Demonstração do cumprimento e auditorias",
      paragrafos: [
        "A Performa LAB disponibiliza ao Cliente a informação razoavelmente necessária para demonstrar o cumprimento das obrigações previstas no presente Acordo e coopera nas auditorias e inspeções legalmente exigíveis.",
        "As auditorias são realizadas pelo Cliente ou por auditor independente sujeito a dever de confidencialidade, mediante aviso prévio razoável, em horário acordado e de modo a não comprometer a segurança, a continuidade do Serviço ou os dados de outros Clientes.",
        "Em caso de incidente de segurança relevante, suspeita fundamentada de incumprimento ou exigência de autoridade competente, as partes acordam um prazo de acesso compatível com a urgência e com as obrigações legais aplicáveis.",
        "As auditorias limitam-se ao necessário para verificar o cumprimento das obrigações de proteção de dados, sem acesso injustificado a informações confidenciais de terceiros.",
      ],
    },
    {
      titulo: "11. Transferências internacionais",
      paragrafos: [
        "A Performa LAB não transfere dados pessoais tratados por conta do Cliente para países terceiros ou organizações internacionais, nem permite acessos que constituam transferências abrangidas pelo RGPD, sem fundamento e garantias adequados nos termos do capítulo V do RGPD e sem respeitar as instruções documentadas do Cliente, salvo quando a transferência seja exigida pelo direito da União ou do Estado-Membro aplicável.",
        "Quando legalmente possível, a Performa LAB informa previamente o Cliente da transferência e disponibiliza a informação necessária sobre o mecanismo de transferência utilizado e as garantias aplicáveis.",
      ],
    },
    {
      titulo: "12. Responsabilidade",
      paragrafos: [
        "A responsabilidade das partes é determinada pelo contrato principal ou pelos Termos de Uso, pelo presente Acordo e pela legislação aplicável, incluindo o artigo 82.º do RGPD.",
        "Nenhuma disposição do presente Acordo exclui ou limita direitos dos titulares, competências das autoridades de controlo ou responsabilidades que não possam ser validamente excluídas ou limitadas por contrato.",
        "A eventual repartição interna de responsabilidades entre o Cliente e a Performa LAB não prejudica os direitos de terceiros nem as regras legais aplicáveis à responsabilidade de cada parte.",
      ],
    },
  ],
});
