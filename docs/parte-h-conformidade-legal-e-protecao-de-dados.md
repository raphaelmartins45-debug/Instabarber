## Parte H · Conformidade legal e proteção de dados

O sistema trata dados pessoais de terceiros em nome das barbearias. A Performa
LAB é **subcontratante**; a barbearia é **responsável pelo tratamento**. Esta
distinção tem consequências práticas desde o primeiro dia.

### H.1 · Proteção de dados

- Servidores na União Europeia (Supabase em Frankfurt; funções Vercel em fra1; Resend na região da UE).
- Acordo de subcontratação (art. 28.º do RGPD) com cada barbearia, aceite na adesão, com a lista de subcontratantes ulteriores: Supabase, Vercel, Resend, Zoho.
- Política de Privacidade e Termos ligados a partir da página de cada barbearia e do formulário de adesão.
- **Consentimento** explícito, registado com data e hora (`consentimento_em`), para mensagens promocionais. A caixa nasce desmarcada em todos os formulários (marcação, QR, loja, fila). Clientes importados ficam sem consentimento até o darem.
- **Minimização:** data de nascimento, e-mail e NIF do cliente são opcionais, com a finalidade escrita ao lado do campo.
- **Direito de eliminação:** `anonimizar_cliente()` apaga os dados pessoais (nome, telefone, e-mail, NIF, data de nascimento, notas, fichas técnicas, conteúdo das mensagens, conta) e mantém os registos financeiros anonimizados pelo prazo legal.
- **Dados de saúde:** a plataforma não tem campos para eles. Os campos de notas e a ficha técnica mostram o aviso «Não registe dados de saúde», e a política de utilização proíbe-o. Não há deteção automática: a responsabilidade é de quem escreve.
- Cópias nativas do Supabase Pro (7 dias) e cópia externa com 30 dias de retenção. Restauro testado antes do primeiro cliente (L.7).
- Autenticação de dois fatores obrigatória para o super_admin, exigida pela própria base de dados (sessão `aal2`).
- Auditoria das ações sensíveis: funcionalidades, módulos, campos protegidos do inquilino, anonimizações, vista de apoio.
- **Fim do contrato:** a Performa LAB entrega à barbearia os dados exportados e, passado o prazo do Acordo de Subcontratação (por omissão, 30 dias depois da entrega), elimina-os (art. 28.º, n.º 3, g; manual do operador, P-18). As cópias de segurança apagam-se ao fim de 30 dias.
- **Leads comerciais (Parte N):** a Performa LAB é responsável pelos dados das pessoas de contacto que pedem informação (nome, telefone, e-mail, barbearia), com base em diligências pré-contratuais. Um lead sem contrato apaga-se 12 meses depois do último contacto (manual do operador, P-24); contratos e propostas ligadas a contratos guardam-se pelos prazos legais. A Política de Privacidade do site diz o que se guarda e por quanto tempo quando o módulo entrar (Fase 3B).
- Violação de dados: procedimento na M.6.

### H.2 · Obrigações perante o consumidor

- **Livro de Reclamações:** a página pública de cada barbearia liga para o Livro de Reclamações eletrónico, configurado na Gestão do sistema.
- **Preços com IVA:** todos os preços mostrados ao cliente final (serviços, clube, loja, cartões oferta) são preços finais. Os preços sem IVA aparecem só nos painéis.
- **Cancelamento:** a regra de cancelamento da barbearia (antecedência) aparece na confirmação da marcação.

### H.3 · Regras fiscais na versão 1

- A plataforma **não emite documentos fiscais nem processa pagamentos** (DECISOES D-01).
- Nenhum documento gerado se chama «recibo» ou «fatura». Os PDF (resumo da contratação, relatório, cartão oferta) dizem «Não é documento fiscal».
- Os acertos entre barbearia e barbeiros são controlo interno e não substituem faturas nem recibos verdes.
- Os módulos preparados para a faturação seguem a G.4 e precisam de parecer de um contabilista antes de serem ativados.

### H.4 · Documentos legais

Três documentos redigidos, a publicar e a ligar ao formulário de adesão:

- **Termos de Uso**: obrigações de cada parte, preços (com e sem IVA, mensal e anual), cancelamento e foro.
- **Política de Privacidade**: as duas situações (a barbearia como titular; o cliente final, cujo responsável é a barbearia), bases jurídicas, prazos de conservação, direitos e o contacto privacidade@instabarber.pt.
- **Acordo de Subcontratação**, nos termos do art. 28.º do RGPD.

Seguem o RGPD e a Lei n.º 58/2019, mas **devem ser revistos por um jurista
antes da publicação**. É um custo único e recomenda-se vivamente.
