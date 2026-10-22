## Parte N · Comercial: CRM, propostas e contratos

O separador **Comercial** do InstaBarber Admin acompanha uma barbearia desde o
primeiro contacto até ao contrato assinado e à criação da conta. É uma
ferramenta interna da Performa LAB: nenhuma barbearia o vê. O esquema SQL está
em `docs/esquema/` (secção 17 das tabelas, 8B das funções) e tem 112 testes
próprios em `testes/40_comercial.sql`.

### N.1 · O que é, e o que não é

**É:** um funil de vendas simples, um briefing que recolhe o que se ouviu, um
gerador de propostas em PDF, um gerador de contratos em PDF a partir da proposta
aceite, e a passagem do contrato assinado para o formulário de adesão.

**Não é:**
- Um CRM genérico: sem automações, sem e-mails em massa, sem pontuação de leads, sem várias equipas.
- Um sistema de assinatura eletrónica: o contrato assina-se fora (N.7) e carrega-se assinado.
- Um sistema de faturação: as propostas e os contratos são documentos comerciais. Não são documentos fiscais (H.3, D-01).
- Um envio automático: o sistema prepara os documentos e as mensagens; quem envia é o operador, e confirma no sistema (CLAUDE.md, regra 7).

**Regras que se mantêm:** uma só aplicação; nada de código por cliente (os
textos jurídicos são modelos em configuração, N.8); isolamento por RLS; zero
cálculos de data fora de Europe/Lisbon; nenhuma dependência nova (PDF com jsPDF,
a fórmula do preço de D.7).

### N.2 · Onde vive

- Rota `instabarber.pt/admin/comercial`, só no domínio principal (D-33), só para o super_admin com dois fatores.
- Cinco separadores: **Funil**, **Leads**, **Propostas**, **Contratos**, **Modelos**.
- Ficheiros: `app/(admin)/admin/comercial/`, `lib/comercial/` (briefing, proposta, contrato, marcadores), `lib/repositorios/comercial.ts`. A fórmula do preço é a de `lib/regras/mensalidade.ts` (D.7): não se duplica.
- Armazenamento: bucket privado `comercial` (`leads/<lead_id>/…`), só o super_admin lê e escreve.

### N.3 · O funil e os leads

| Estado | Significado | Como se entra |
| --- | --- | --- |
| Novo | Pediu contacto e ninguém falou com ele | Formulário do site, ou lead criado à mão |
| Contactado | Houve uma primeira conversa | À mão |
| Demonstração | Demonstração marcada ou feita | À mão |
| Proposta | Há uma proposta criada | Automático ao criar a primeira proposta |
| Ganho | Contrato assinado | **Só** ao assinar o contrato (`assinar_contrato`) |
| Perdido | Não avançou | À mão, com motivo obrigatório |

Um lead ganho não volta atrás. Um lead perdido pode ser reaberto.

**O lead.** Nome do contacto, barbearia, cidade, telefone, e-mail (pelo menos um
dos dois), número de barbeiros indicado, origem (site, WhatsApp, e-mail,
indicação, visita, outro), próxima ação e data.

**O histórico** de cada lead é uma linha do tempo: notas, chamadas, mensagens,
mudanças de estado, propostas e contratos. Mudanças de estado, propostas e
contratos escrevem-se sozinhas; notas, chamadas e mensagens registam-se à mão e
atualizam o «último contacto» e a próxima ação.

**O ecrã Funil** mostra as colunas por estado, com o número de leads e o valor
potencial (a mensalidade das propostas enviadas). Os cartões com a próxima ação
vencida ficam realçados. Sem tarefas agendadas (D-16): quem vê é quem abre o
ecrã. Alerta no painel geral do Admin: leads novos há mais de dois dias úteis, e
propostas enviadas a expirar nos próximos três dias.

**O formulário do site** (landing, I.3 e H.1) chama `submeter_lead()`:
- Valida nome, contacto e e-mail. A rota aplica o limite por IP e o campo honeypot; a função aplica o limite por contacto (três pedidos por hora).
- Responde sempre «recebido» a quem não abusa. Se o contacto já tem um lead aberto, não cria outro: acrescenta uma linha ao histórico.
- Envia um e-mail curto a `comercial@instabarber.pt` pelo Resend, com a ligação para o lead.
- A Política de Privacidade do site passa a dizer que o pedido se guarda (H.1).

### N.4 · O briefing

Um formulário em passos, por lead, preenchido durante ou logo depois da conversa
de 20 minutos. Guarda-se em `briefings.dados`, validado com Zod, e pode ser
editado até se criar a proposta. Os campos marcados com * entram na proposta.

| Passo | Campos |
| --- | --- |
| 1 · Barbearia | Nome comercial*, firma, NIF, morada, cidade, ano de abertura, n.º de cadeiras, horário |
| 2 · Equipa | N.º de barbeiros*, regime de cada um (empregado ou independente), modelo de caixa A/B/C (F.4.11), quem decide |
| 3 · Situação atual | Como marcam hoje* (telefone, WhatsApp, caderno, outro sistema), sistema atual e custo, clientes ativos (estimativa)*, valor médio de uma visita*, faltas por semana |
| 4 · Dores e objetivos | Dores* (faltas, clientes que desaparecem, financeiro desorganizado, comissões, fidelização, presença online), objetivo principal nos próximos três meses* |
| 5 · Plano recomendado | Plano, profissionais, periodicidade, domínio próprio. O preço calcula-se em tempo real com `mensalidade.ts`, com e sem IVA |
| 6 · Condições | Barbearia piloto (sim/não) e condições de lançamento (texto livre), desafio de 90 dias (só Pro), validade da proposta em dias (por omissão 15), data de arranque pretendida |
| 7 · Contacto e decisor | Nome, cargo, e-mail, telemóvel de quem decide* |

O passo 3 alimenta uma conta de apoio à proposta: **«o que isto vale para si»**.
Calcula-se com a regra da F.1 (clientes que deixaram de vir × valor da visita ×
0,4) e compara-se com a mensalidade. É sempre apresentada como estimativa, nunca
como promessa, e só aparece se o operador preencher os números no briefing.

### N.5 · A proposta

**Gerar.** «Gerar proposta» a partir do briefing cria uma **versão** (`criar_proposta`),
com número `PRP-AAAA-NNNN`, e fotografa tudo em `propostas.dados`. Uma versão
nova substitui a anterior ainda aberta. Estados: rascunho → enviada → aceite ou
recusada; substituída quando há versão nova; **expirada** é calculada ao ler
(a validade conta desde o envio, em hora de Lisboa), sem tarefa agendada.

**Depois de enviada, o preço e o conteúdo não mudam** (gatilho na base de dados).
Para mudar, cria-se uma versão nova. Os valores guardados batem com a fórmula: a
base de dados recusa um valor com IVA que não seja o sem IVA × 1,23 arredondado.

**O PDF** (jsPDF, A4, identidade da Performa LAB: cabeçalho preto, dourado,
paginação no rodapé, logótipo InstaBarber de `public/marca/`):

1. **Capa:** logótipo, «Proposta comercial», nome da barbearia, número, data, validade, contacto de quem propõe.
2. **O que ouvimos:** a situação atual e os objetivos, nas palavras do briefing.
3. **A solução:** as funcionalidades do plano, ligadas às dores marcadas (por exemplo, faltas → lembrete de marcação; clientes que desaparecem → radar e mensagem de recuperação). Gerado a partir da grelha D.3, só com o que o plano inclui.
4. **O que fica incluído:** a lista completa da D.9.
5. **Investimento:** plano, profissionais, periodicidade, decomposição (D.5), preço com e sem IVA, domínio próprio se houver. A conta do desafio e o «o que isto vale para si», se existirem.
6. **Desafio de 90 dias** (se Pro): as condições da D-36, tal como estão na landing.
7. **Condições de lançamento** (se piloto): o texto livre do passo 6.
8. **Como arrancamos:** os passos da D.12 (aceitar, formulário de adesão, importação dos clientes, primeira semana — P-04), sem prometer prazos que o operador não tenha escrito.
9. **Condições:** modelo `condicoes_proposta` (validade, sem fidelização, cancelamento, dados na UE, «Não é documento fiscal»).
10. **Próximo passo e assinatura:** «InstaBarber · Performa LAB», com o e-mail e o telefone comerciais (só a proposta leva o telefone; o contrato leva apenas nome, NIF e domicílio da Prestadora).

O logótipo do cliente, se o operador o carregar no lead, aparece na capa ao
lado do da Performa LAB. É opcional.

**Enviar.** O sistema não envia a proposta. O operador descarrega o PDF, envia-o
por e-mail ou WhatsApp (o ecrã oferece o texto de acompanhamento pronto, com
`wa.me` e `mailto`) e carrega «Marcar como enviada». Só então começa a validade.

**Decidir.** «Aceite» ou «Recusada» (com motivo). Uma proposta expirada não se
aceita: gera-se uma versão nova com preços e validade renovados.

### N.6 · O contrato

**Gerar.** Só de uma proposta **aceite**. O operador confirma os dados do
contratante, que vêm do briefing e da proposta: firma, NIF (validado pelo dígito de
controlo), morada, representante e cargo. «Gerar contrato» (`gerar_contrato`):
- exige um **modelo aprovado** (N.8); com o modelo em rascunho, recusa;
- substitui os marcadores `{{…}}` do modelo pelos dados da proposta aceite (plano, profissionais, preços com e sem IVA, periodicidade, domínio, desafio, validade) e **fotografa o texto final**;
- dá o número `CTR-AAAA-NNNN`; gerar outra vez cancela o rascunho anterior (só há um contrato ativo por proposta);
- gera o PDF, com a proposta aceite em anexo.

**Anexos.** I — Proposta aceite (a fotografia, não a versão atual); II — Termos de Uso e Política de Privacidade; III — Acordo de Subcontratação (RGPD, art. 28.º; rascunho em `docs/comercial/modelo-acordo-subcontratacao.md`); IV — Desafio de 90 dias, se existir. O modelo base está em `docs/comercial/modelo-contrato.md`.

**Estados.** Rascunho → enviado → assinado → terminado; cancelado (só antes de
assinado). Depois de assinado, o texto, os dados, o número e o PDF assinado **não
se alteram** (gatilho). Muda-se com um aditamento: contrato novo.

### N.7 · Assinar e fechar o negócio

1. O operador descarrega o PDF e envia-o. A assinatura faz-se **fora do sistema**: assinatura digital qualificada (por exemplo, a Chave Móvel Digital, gratuita) ou impressão, assinatura e digitalização. Uma resposta de e-mail a dizer «aceito» não substitui o contrato assinado. A escolha entre estas vias e o valor probatório de cada uma é para o jurista confirmar (N.8).
2. Com o ficheiro assinado: «Registar assinatura» pede a data e o PDF assinado (`assinar_contrato`). Sem o ficheiro, não regista.
3. O lead passa a **Ganho**, fica em auditoria e o histórico regista-o.
4. «Criar convite de adesão» (`criar_convite_adesao`) gera uma ligação de uso único, válida 14 dias, para o formulário de adesão **já preenchido** com o que se sabe: nome, contacto, plano, profissionais, periodicidade, domínio. O dono completa o resto (D.8). A ligação leva um código, de que só se guarda o hash; nunca leva palavra-passe.
5. Quando o dono envia o formulário, o pedido fica ligado ao contrato (`usar_convite_adesao`). Na aprovação (P-03), o inquilino criado liga-se ao contrato e ao lead (`ligar_contrato_inquilino`) e a data de início fica definida.

### N.8 · Os modelos de documento

Os textos jurídicos e comerciais são **dados**, não código (regra: configuração,
nunca código por cliente). Vivem em `modelos_documento`, em Markdown com
marcadores.

- Dois tipos: `contrato` e `condicoes_proposta`. Cada um com versões numeradas.
- Estados: **rascunho** (não gera documentos), **aprovado** (gera), **arquivado**. Aprovar exige quem aprovou e quando; fica registado.
- O ecrã Modelos permite editar um rascunho e pré-visualizar com dados de exemplo. Um modelo aprovado não se edita: cria-se uma versão nova. Os contratos já gerados guardam o texto que usaram.
- **Marcadores** aceites: `{{contratante.razao_social}}`, `{{contratante.nif}}`, `{{contratante.morada}}`, `{{contratante.representante}}`, `{{contratante.cargo}}`, `{{proposta.numero}}`, `{{plano}}`, `{{profissionais}}`, `{{periodicidade}}`, `{{valor_sem_iva}}`, `{{valor_com_iva}}`, `{{iva_texto}}` (por exemplo, «Isento de IVA, nos termos do artigo 53.º do CIVA.», ou «IVA à taxa de 23 % incluído.»), `{{dominio_proprio}}`, `{{data_inicio}}`, `{{data_assinatura}}`, `{{contrato.numero}}`, `{{prestadora.nome}}`, `{{prestadora.nif}}`, `{{prestadora.morada}}`, `{{prestadora.qualidade}}`, `{{prestadora.assinante}}` (os dados mínimos de quem presta o serviço: vêm das variáveis `PRESTADORA_*` do ambiente, nunca do texto do modelo nem do repositório. O contrato fotografa-os ao ser gerado), `{{contratante.email}}`, `{{condicoes_lancamento}}` e `{{desafio}}` (texto do desafio de 90 dias, ou «Não aplicável»). Os marcadores opcionais (`{{dominio_proprio}}`, `{{condicoes_lancamento}}`, `{{desafio}}`) preenchem-se com «Não aplicável» quando a proposta não os tem. Um marcador desconhecido, ou um obrigatório sem valor, impede a geração e diz qual.
- **Revisão jurídica.** Os modelos entregues em `docs/comercial/` (contrato, Acordo de Subcontratação e condições da proposta, com as `notas-para-o-jurista.md`) apoiam-se na lei portuguesa e europeia aplicável (cláusulas contratuais gerais, pagamentos em atraso entre empresas, RGPD, Regulamento dos Dados, assinatura eletrónica) e são **rascunhos para um jurista rever**: preço, responsabilidade, foro, prazos e a validade da assinatura escolhida. O sistema não impede um modelo de ser aprovado sem revisão: a aprovação é uma decisão do dono, e a regra é que só se aprova depois do parecer.

### N.9 · Dados pessoais no comercial

- A Performa LAB é **responsável** pelos dados dos leads (pessoas de contacto de empresas), com base em diligências pré-contratuais a pedido do titular (H.1).
- Prazo: um lead que não chega a cliente é apagado 12 meses depois do último contacto. Como não há tarefas agendadas, é um procedimento mensal à mão (P-24, `apagar_leads_inativos`). Os leads com contrato nunca se apagam por esta via: seguem os prazos legais de conservação dos contratos e da faturação.
- A Política de Privacidade do site e a landing dizem o que se guarda e por quanto tempo, e têm de ser atualizadas na Fase 3B, quando o formulário passar a gravar.
- Pedidos de apagamento de um lead (P-12) apagam o lead, o briefing, as propostas e o histórico, desde que não exista contrato.

### N.10 · Segurança

- Todas as tabelas e funções do comercial só respondem ao super_admin com dois fatores (`aal2`). Sem segundo fator, nada se vê e nenhuma função corre. Os testes cobrem dono, barbeiro, cliente final, visitante e super_admin sem 2FA.
- O visitante só pode executar `submeter_lead`, `ler_convite_adesao` e `usar_convite_adesao`; a primeira não revela se o contacto já existe, e as outras só devolvem algo a quem tem o código.
- Funções internas (numeração, histórico) não se chamam de fora.
- Ações sensíveis em auditoria: assinatura de contratos e apagamento de leads.

### N.11 · Ordem de construção e dependências

A **Fase 3B** (fases/fase-3b.md) vem logo depois da Fase 3, porque precisa do
Admin com 2FA, do formulário de adesão e da fórmula do preço. Entrega-se por
camadas, cada uma útil sozinha: (1) leads e funil, com o formulário do site;
(2) briefing e proposta em PDF; (3) modelos e contrato; (4) convite de adesão e
ligação ao inquilino. Antes de a camada 3 ser usada com um cliente real, o
modelo de contrato tem de ter parecer jurídico.
