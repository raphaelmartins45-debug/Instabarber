import type { DocumentoLegal, Prestadora } from "./tipos";

// Política de Privacidade (H.1, H.4): as duas situações — a barbearia e quem fala com a
// Performa LAB (responsável: Performa LAB) e o cliente final (responsável: a barbearia).
// Revista com o jurista (D-155).

export const privacidade = (p: Prestadora): DocumentoLegal => ({
  titulo: "Política de Privacidade",
  versao: "Versão de 25 de outubro de 2026",
  introducao: [
    `Esta Política explica como são tratados os dados pessoais no InstaBarber, fornecido por ${p.nome}, NIF ${p.nif}, com domicílio profissional em ${p.morada}, que atua sob a designação comercial «Performa LAB». Contacto para proteção de dados: privacidade@instabarber.pt.`,
    "Há duas situações diferentes, e em cada uma o responsável pelo tratamento é outro.",
  ],
  seccoes: [
    {
      titulo: "1. Quando a Performa LAB é a responsável",
      paragrafos: [
        "A Performa LAB é responsável pelos dados das pessoas que pedem informação no site instabarber.pt, das barbearias que aderem (nome, NIF, contactos, morada, dados de faturação e preferência de pagamento) e dos utilizadores das barbearias (nome, e-mail e registos de acesso).",
        "Finalidades e bases jurídicas: responder a pedidos de informação e propor a contratação (diligências pré-contratuais a pedido do titular); gerir a adesão e o contrato, faturar e prestar suporte (execução do contrato); garantir a segurança da Plataforma, registar ações sensíveis e prevenir abusos (interesse legítimo); cumprir obrigações legais, nomeadamente fiscais (obrigação legal). Não enviamos publicidade sem consentimento.",
        "Conservação: pedidos de informação sem contrato, até 12 meses depois do último contacto; dados do contrato e de faturação, pelo prazo legal de conservação dos documentos fiscais; os registos de segurança são conservados durante o período definido na política interna de retenção, proporcional às finalidades de segurança, investigação de incidentes e defesa de direitos, sendo eliminados ou anonimizados quando deixem de ser necessários, salvo obrigação legal de conservação ou necessidade legítima de preservação de prova.",
        "O site e a Plataforma utilizam os cookies e tecnologias de armazenamento estritamente necessários ao funcionamento, à autenticação e à segurança do Serviço. As preferências que a própria pessoa escolhe (como o tema claro ou escuro) ficam guardadas apenas no seu dispositivo.",
        "As estatísticas de utilização são realizadas apenas nos termos da implementação técnica efetivamente utilizada: hoje, o site conta visitas e cliques registando só o nome do evento, sem cookies, sem guardar o endereço IP e sem identificadores. Quando forem utilizados identificadores ou outros elementos que permitam identificar ou singularizar utilizadores, a respetiva utilização e o tratamento de dados pessoais serão descritos nesta Política e sujeitos às exigências legais aplicáveis.",
        "Não são utilizados cookies ou tecnologias de rastreio para publicidade comportamental, salvo se essa finalidade vier a ser introduzida e previamente comunicada nos termos legalmente exigíveis.",
      ],
    },
    {
      titulo: "2. Quando a barbearia é a responsável",
      paragrafos: [
        "Os dados dos clientes de cada barbearia (nome, telefone, e-mail, data de nascimento e NIF opcionais, marcações, histórico, selos, notas e fichas técnicas, consentimentos e mensagens registadas) e da sua equipa são tratados por conta da barbearia, que é a responsável pelo tratamento. A Performa LAB é subcontratante e trata-os só segundo as instruções da barbearia, nos termos do Acordo de Subcontratação.",
        "Os pedidos de acesso, retificação, apagamento ou outros direitos sobre esses dados dirigem-se à barbearia. Se chegarem à Performa LAB, são reencaminhados para a barbearia no prazo de 2 dias úteis.",
        "A data de nascimento, o e-mail e o NIF do cliente são opcionais e têm a finalidade escrita ao lado do campo. As mensagens promocionais só se enviam com consentimento, registado com data e hora, e a caixa de consentimento nasce sempre desmarcada. A Plataforma não tem campos para dados de saúde e a sua utilização para esse fim está proibida.",
      ],
    },
    {
      titulo: "3. Quem mais trata os dados",
      paragrafos: [
        "Os dados são tratados por prestadores que atuam por conta da Performa LAB, com as mesmas obrigações de proteção:",
      ],
      lista: [
        "Supabase — base de dados, autenticação e ficheiros (União Europeia);",
        "Vercel — alojamento da aplicação (União Europeia);",
        "Resend — envio de e-mails transacionais (União Europeia);",
        "Zoho — caixa de correio da Performa LAB (centro de dados europeu).",
      ],
    },
    {
      titulo: "3.1. Lista de prestadores",
      paragrafos: [
        "A lista de prestadores é mantida atualizada pela Performa LAB. A informação relativa a cada prestador identifica a função desempenhada no Serviço e a localização de tratamento aplicável, de acordo com os contratos e a configuração efetiva dos serviços utilizados. Qualquer alteração relevante é comunicada nos termos do Acordo de Subcontratação e da legislação aplicável.",
      ],
    },
    {
      titulo: "4. Onde ficam os dados e como são protegidos",
      paragrafos: [
        "A Performa LAB procura manter os dados pessoais no Espaço Económico Europeu, de acordo com a configuração dos serviços utilizados. Qualquer transferência de dados pessoais para países terceiros, incluindo acessos remotos que constituam uma transferência abrangida pelo RGPD, depende do cumprimento dos requisitos do capítulo V do RGPD e das instruções aplicáveis ao tratamento por conta do Cliente.",
        "Medidas de segurança: isolamento dos dados de cada barbearia na própria base de dados, cifragem em trânsito, autenticação de dois fatores para o acesso administrativo, controlo de acessos por papéis, registo das ações sensíveis e cópias de segurança com retenção de 30 dias. Nenhuma palavra-passe é enviada por e-mail nem fica visível: cada pessoa define a sua por ligação segura, e as palavras-passe guardam-se apenas como resumo criptográfico (hash).",
      ],
    },
    {
      titulo: "5. Os seus direitos",
      paragrafos: [
        "Pode pedir o acesso, a retificação, o apagamento, a limitação, a portabilidade e opor-se ao tratamento, escrevendo para privacidade@instabarber.pt (ou para a barbearia, quando ela for a responsável). Quando o tratamento se baseia no consentimento, pode retirá-lo a qualquer momento, sem afetar o tratamento anterior.",
        "Pode também apresentar reclamação à Comissão Nacional de Proteção de Dados (www.cnpd.pt).",
      ],
    },
    {
      titulo: "6. Alterações",
      paragrafos: [
        "Esta Política pode ser atualizada. A versão em vigor está sempre publicada nesta página, com a data.",
      ],
    },
  ],
});
