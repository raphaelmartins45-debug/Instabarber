import type { DocumentoLegal, Prestadora } from "./tipos";

// Acordo de Subcontratação (art. 28.º do RGPD), aceite na adesão. Mesmo conteúdo do Anexo III
// do contrato (docs/comercial/modelo-acordo-subcontratacao.md), com os prazos propostos fixados.

export const subcontratacao = (p: Prestadora): DocumentoLegal => ({
  titulo: "Acordo de Subcontratação",
  versao: "Versão de 22 de outubro de 2026",
  introducao: [
    "Responsável pelo tratamento: a barbearia que adere ao InstaBarber («Cliente»), identificada no pedido de adesão.",
    `Subcontratante: ${p.nome}, NIF ${p.nif}, com domicílio profissional em ${p.morada}, que atua sob a designação comercial «Performa LAB» («Performa LAB»).`,
    "Este acordo cumpre o artigo 28.º do Regulamento (UE) 2016/679 (RGPD) e faz parte da adesão ao InstaBarber.",
  ],
  seccoes: [
    {
      titulo: "1. Objeto, natureza e duração",
      paragrafos: [
        "A Performa LAB trata dados pessoais por conta do Cliente, para lhe prestar o serviço InstaBarber (agenda, clientes, equipa, financeiro, fidelização, mensagens registadas e página pública), durante a vigência da adesão e até à eliminação prevista na cláusula 9.",
      ],
    },
    {
      titulo: "2. Tipos de dados e titulares",
      paragrafos: [
        "Titulares: clientes finais da barbearia; profissionais e outros utilizadores do Cliente.",
        "Dados: nome, telefone, e-mail, NIF (opcional), data de nascimento (opcional), notas e fichas técnicas, marcações e histórico de visitas, consentimentos, mensagens registadas e dados de acesso (palavra-passe cifrada, nunca visível). Não são admitidos dados de saúde nem outras categorias especiais.",
      ],
    },
    {
      titulo: "3. Instruções",
      paragrafos: [
        "A Performa LAB só trata os dados segundo as instruções documentadas do Cliente: as dos Termos de Uso, deste acordo e as que o Cliente der através da Plataforma. Se entender que uma instrução viola a lei, informa o Cliente de imediato.",
      ],
    },
    {
      titulo: "4. Confidencialidade",
      paragrafos: [
        "As pessoas autorizadas a tratar os dados estão sujeitas a dever de confidencialidade. O acesso da Performa LAB aos dados é limitado ao necessário, só através de contas pessoais com autenticação de dois fatores, e as consultas de suporte ficam registadas, com justificação.",
      ],
    },
    {
      titulo: "5. Segurança",
      paragrafos: [
        "A Performa LAB mantém, no mínimo: isolamento dos dados de cada cliente na base de dados; cifragem em trânsito; autenticação de dois fatores para o acesso administrativo; cópias de segurança com retenção de 30 dias; registo de ações sensíveis; alojamento na União Europeia; controlo de acessos por papéis. As medidas são revistas periodicamente (artigo 32.º do RGPD).",
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
      ],
    },
    {
      titulo: "7. Direitos dos titulares",
      paragrafos: [
        "A Performa LAB presta ao Cliente a assistência técnica para responder a pedidos de acesso, retificação, apagamento, limitação, portabilidade e oposição. Se receber um pedido diretamente, reencaminha-o ao Cliente no prazo de 2 dias úteis, sem lhe responder, salvo instrução em contrário. A Plataforma permite exportar e anonimizar os dados de um cliente final.",
      ],
    },
    {
      titulo: "8. Violação de dados",
      paragrafos: [
        "A Performa LAB notifica o Cliente sem demora injustificada e, se possível, no prazo de 48 horas após ter conhecimento de uma violação de dados pessoais, com a natureza da violação, os dados e titulares afetados, as consequências prováveis e as medidas tomadas ou propostas, para o Cliente cumprir os artigos 33.º e 34.º do RGPD. Presta ainda assistência nas avaliações de impacto e consultas prévias (artigos 35.º e 36.º).",
      ],
    },
    {
      titulo: "9. Termo do tratamento",
      paragrafos: [
        "Quando a adesão cessar, a Performa LAB entrega os dados ao Cliente, sem custos, em formato estruturado e legível por máquina, no prazo máximo de 30 dias. Passados 30 dias sobre a entrega, elimina-os, e elimina as cópias de segurança no prazo de 30 dias, salvo se a lei exigir a conservação. Confirma a eliminação por escrito, a pedido.",
      ],
    },
    {
      titulo: "10. Demonstração do cumprimento e auditorias",
      paragrafos: [
        "A Performa LAB disponibiliza ao Cliente a informação necessária para demonstrar o cumprimento deste acordo e permite auditorias, incluindo inspeções, realizadas por ele ou por auditor por ele mandatado, com aviso de 30 dias, durante o horário normal e sem prejudicar a segurança de outros clientes.",
      ],
    },
    {
      titulo: "11. Transferências",
      paragrafos: [
        "Não há transferência de dados para fora do Espaço Económico Europeu sem instrução do Cliente e sem as garantias do capítulo V do RGPD.",
      ],
    },
    {
      titulo: "12. Responsabilidade",
      paragrafos: [
        "Aplicam-se as regras de responsabilidade dos Termos de Uso (ou do contrato, se existir), sem prejuízo do artigo 82.º do RGPD e dos direitos dos titulares.",
      ],
    },
  ],
});
