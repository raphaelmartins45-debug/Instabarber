## Parte E · Especificação das quatro camadas

Cada ecrã mostra só o que as funcionalidades ativas permitem (D.3). Abaixo de
768 px, tudo funciona no telemóvel (I.3.1).

### E.1 · Camada 1 — InstaBarber Admin (Performa LAB)

Acesso em `instabarber.pt/admin`, só no domínio principal (A.3). Só entra o super_admin com sessão de dois fatores. É aqui
que a Performa LAB aprova, configura, liga funcionalidades e regista pagamentos.

#### Painel geral

- Quatro indicadores: barbearias ativas, receita recorrente mensal (com e sem IVA), adesões no mês, pedidos pendentes.
- Alertas: mensalidades em atraso, barbearias suspensas, vencimentos nos próximos sete dias, barbearias com sinais de abandono (M.2), feriados do ano seguinte por carregar (a partir de novembro).
- Atividade recente, lida da auditoria.

#### Barbearias

- Lista com pesquisa e filtros por estado, plano e periodicidade. Colunas: nome, plano, estado, funcionalidades ativas, endereço público, mensalidade.
- A ficha do inquilino tem **dez separadores**: Identidade, Marca, Contactos, Horário, Serviços, Equipa, Funcionalidades, Pagamentos, Importação, Auditoria. Cada separador grava de forma independente, com confirmação visual.
- **Importação** (nova): carrega um CSV de clientes (nome, telemóvel, e-mail, data de nascimento, notas) e um de serviços (nome, duração, preço). Mostra a pré-visualização, as linhas com erro (telemóvel inválido, duplicado) e só grava as válidas. Os clientes importados ficam com origem «importação» e **sem consentimento para mensagens promocionais** até o darem.
- Ações rápidas: suspender, reativar, cancelar, **exportar dados** (da barbearia inteira em CSV, num ficheiro comprimido, para lhe entregar quando sai — RGPD, art. 28.º, n.º 3, g; ou de um só cliente, a pedido escrito da barbearia) e **eliminar definitivamente** (só com a barbearia cancelada, pedindo o slug como confirmação; chama `eliminar_inquilino()` e apaga as contas que ficam sem uso). Os procedimentos estão no manual do operador (P-12, P-18).
- **Domínio próprio**, no separador Identidade: o domínio e o interruptor do extra (+5,00 € por mês); a mensalidade recalcula com a D.7. O procedimento de ligação está no manual do operador.
- **Vista de apoio**: o super_admin abre o painel da barbearia em modo só de leitura, com a sua própria sessão (o RLS já lhe dá leitura). Exige justificação escrita, dura no máximo 30 minutos, mostra uma faixa visível e fica em auditoria. Nunca se partilham palavras-passe.

#### Comercial

Separador do Admin para o processo de venda, da primeira conversa ao contrato assinado: Funil, Leads, Propostas, Contratos e Modelos. Especificado na Parte N; é construído na Fase 3B. O formulário da landing alimenta-o e o convite de adesão pré-preenche o formulário D.8.

#### Finanças

Separador do Admin para o dinheiro da Performa LAB: custos, contas a pagar, lucro, ponto de equilíbrio, objetivo de faturação, previsões, exportação e lembretes de vencimento aos inquilinos (WhatsApp e e-mail). Especificado na Parte O; é construído na Fase 3C. Lê os recebimentos e as faturas do separador Pagamentos.

#### Pedidos de adesão

- Lista dos pedidos pendentes, com plano, profissionais, mensalidade e preferência de pagamento em destaque.
- Cada pedido abre com os dados, as imagens e a verificação das imagens (D.8.1).
- **Aprovar** cria o inquilino ativo, gera o slug, aplica o pacote, cria a conta do dono e envia o e-mail de boas-vindas. **Rejeitar** pede motivo e responde por e-mail. **Ajustar** abre a ficha completa antes de aprovar. A mensalidade é recalculada com `lib/regras/mensalidade.ts`.

#### Funcionalidades

- Seletor de inquilino no topo.
- A grelha D.3 por grupos: caixa, nome, descrição e etiqueta de estado (no pacote, bónus, inativa). Bónus realçados a dourado.
- Painel lateral com o contador de ativas, o resumo e a mensalidade.
- «Guardar alterações» aplica e escreve em auditoria. «Repor pacote» volta ao plano.

#### Pagamentos

- Indicadores: receita do mês, mensalidades em dia e em atraso, valor em atraso, projeção anual.
- Tabela de barbearias com plano, periodicidade, estado de pagamento, próximo vencimento e valor.
- Faturas da Performa LAB: número (do programa certificado da Performa LAB), período, valor, emitida, paga.
- Registo de recebimentos: data, método (dinheiro, MB WAY, transferência), valor e fatura. Sem cobrança automática.

#### Módulos (pagamentos e faturação)

Ecrã próprio, descrito na G.4: interruptor geral por módulo e ligação por
barbearia. Desligados por omissão. Nada disto aparece à barbearia.

### E.2 · Camada 2 — InstaBarber Gestão (painel da barbearia)

Acesso em `/app`. Entra o proprietário; os profissionais entram na sua área
(E.3). Todos os dados pertencem só àquela barbearia.

#### Início

- Faixa de ação: «Registar serviço ao balcão» e «Marcar cliente».
- Quatro indicadores: faturado hoje, previsão do dia, faturado no mês, falta para o objetivo com os dias de funcionamento restantes. «Faturado» segue a definição única da F.4.11.
- Marcações de hoje: horário, cliente, serviço, profissional e valor; concluídas a verde. Cada linha tem «Concluir», «Faltou» e o botão de lembrete.
- **Pedidos de acesso** (B9): clientes que pediram código para entrar na área deles. Cada linha mostra o nome, o telemóvel, o tempo restante (15 minutos) e o botão «Enviar código por WhatsApp», que abre o wa.me com o código já escrito.
- Contas a pagar pendentes, com «Paguei».
- Clientes a contactar, com botão de mensagem (Pro) ou chamada de upgrade (Basic).

#### Clientes

- Quatro indicadores: perdidos, em risco, faturação a recuperar, ticket médio.
- Filtros: ativos, em risco, perdidos, sem histórico, **não registados** (entraram por QR, loja ou fila sem conta), e campo de busca.
- Faixa de ação que muda com o filtro, com «Enviar em lote» e o contador de destinatários (Pro).
- Tabela: cliente, estado, última visita, dias sem vir, ticket, selos e botão de mensagem.
- **Ficha do cliente**: dados, consentimento (com data), histórico de visitas, selos e resgates, plano do clube, pedidos da loja, **ficha técnica** (notas e fotografias do corte, por barbeiro, `ficha_tecnica`), faltas e o botão «Voltar a permitir marcação online» quando a política de faltas o bloqueou.
- **Envio em lote**: janela com pré-visualização, fila de destinatários e botão que percorre a fila por ordem; cada clique abre uma conversa. Clientes sem consentimento ou com «não contactar» nunca entram na fila de mensagens promocionais.
- Cada mensagem abre o WhatsApp do próprio cliente, com o nome, os dias sem vir, o último serviço e a data, e a ligação para a página pública.

#### Agenda

- Agenda do dia por horário e por profissional, com serviços e valores; vagas livres assinaladas; ausências e férias a cinzento com o motivo.
- Botão de lembrete por marcação: abre o WhatsApp do cliente com nome, serviço, data, hora, barbeiro e, se a marcação for nesse dia, quantos minutos faltam (D-54), e regista `lembrete_aberto_em`. Disponível nos dois planos (`lembretes_marcacao`).
- «Lembretes em lote» no topo: fila das marcações por atender sem lembrete, uma conversa de cada vez (Pro, `envio_lote`).
- **Marcar ao balcão**: escolhe cliente (procura pelo telemóvel ou cria), serviço, profissional e hora; a base de dados valida a vaga e aplica o preço do período.
- **Concluir**: abre a confirmação com o valor (editável, por exemplo um extra pago ao balcão) e, quando aplicável, as opções «Usar crédito do clube», «Usar prémio de selos» e «Pagar com cartão oferta». Chama `concluir_marcacao()`.
- Indicadores do dia: marcações, faturação, ocupação.

#### Equipa

- Um separador por profissional, com quatro indicadores: faturado hoje, previsão do dia, faturado no mês, falta para o objetivo diário.
- Agenda do dia daquele profissional e progresso para o objetivo (Pro: `metas_profissional`).

#### Financeiro

- Objetivo do mês: faturado, falta e barra de progresso.
- Objetivos por profissional (Pro).
- Custos fixos e despesas, com «Paguei» e remover.
- Resumo do mês: faturação, custos, despesas, comissões, resultado e margem.
- **Comissões e acertos** (`comissoes_acertos`): uma linha por barbeiro com modelo, serviços, receita, acerto, liquidado e saldo; «Registar acerto» (F.4.11). Nota fixa: «Os acertos são controlo interno. Não substituem faturas nem recibos verdes.»

#### Gestão do sistema — só o gestor

A única forma de alterar a configuração da barbearia. O barbeiro não tem acesso,
nem pelo menu nem por endereço direto. Secções (cada uma só aparece com a
funcionalidade ativa):

- **Estado:** interruptor aberto/fechado — fechado, a página pública não aceita marcações; o balcão continua.
- **Marca:** cor da capa (paleta proposta a partir do logótipo, com pré-visualização em tempo real), logótipo, fachada, galeria, história, mostrar mapa e história.
- **Horário:** abertura, fecho, dias de descanso, almoço, fechar nos feriados nacionais, e os parâmetros da agenda — granularidade, intervalo entre marcações, antecedência mínima, antecedência de cancelamento e janela de marcação (F.7).
- **Ausências e feriados:** férias, folgas e formações por barbeiro ou da barbearia inteira; feriados próprios (municipal, Carnaval, dias fechados).
- **Equipa:** registo de barbeiros com nome, e-mail e NIF (opcional). Ao gravar, o barbeiro recebe um **convite por e-mail** para definir a palavra-passe (E.3). Para cada um: horário próprio, comissão por omissão e por serviço, modelo de caixa (com «Aplicar a todos»), renda no modelo C, cancelar e repor acesso.
- **Serviços:** nome, descrição, duração e preço final. Com `multilinguagem`, campos opcionais em inglês e francês (F.3.2).
- **Fidelização:** selos necessários (por omissão 10), prémio ativo e qual o serviço (F.2.1).
- **Aniversário:** desconto ativo e percentagem (F.3.1).
- **Faltas:** limite de faltas para bloquear a marcação online (F.8).
- **Ligações:** endereço para avaliação no Google e do Livro de Reclamações eletrónico.
- **Clube, loja, períodos de desconto, cartões oferta:** com as respetivas funcionalidades (F.4).
- **Marcações sem profissional:** a lista das órfãs, com atribuição manual.

Regra de separação: o barbeiro acompanha o próprio trabalho; só o gestor
governa a barbearia.

#### O meu plano

Sempre visível, em modo de leitura: plano, periodicidade, profissionais
contratados, mensalidade com e sem IVA, próximo vencimento, faturas e
recebimentos, o que está incluído e o que não está. Sem botões de ativação:
«Para mudar o plano, fale com a Performa LAB», com ligação para o apoio@.

### E.3 · Camada 3 — InstaBarber Equipa (painel do profissional)

Acesso em `/app/equipa/[id]`. O cabeçalho identifica sempre quem está a ver:
«Vista do Carlos»; na vista do gestor, «Vista do gestor».

#### Registo de um barbeiro novo

1. O gestor preenche nome, e-mail e NIF (opcional) na Gestão do sistema.
2. Ao gravar, o servidor cria a conta no Supabase Auth com **convite por e-mail** (enviado pelo Resend), o perfil de profissional ligado ao inquilino e a linha em `profissionais`.
3. O barbeiro abre a ligação do convite e define a sua palavra-passe. **O NIF nunca é palavra-passe.**
4. Se o barbeiro não entrar em 24 horas, o gestor vê um aviso com «Reenviar convite».
5. O nome do barbeiro aparece de imediato na agenda, na marcação pública e nos painéis do gestor.

O mesmo barbeiro pode trabalhar em várias barbearias com a mesma conta: cada
barbearia acrescenta-lhe um perfil.

#### E.3.1 · Perfil do barbeiro

- **Fotografia:** a que aparece na marcação pública.
- **Nome apresentado:** pode adotar um apelido; é o que aparece na agenda e nos relatórios.
- **Portfólio:** até seis fotografias, com o interruptor «Tornar visível» (`portfolio_barbeiro`).
- **Alterar palavra-passe** e **terminar sessão em todos os dispositivos**.
- Esqueceu-se da palavra-passe: ligação por e-mail, pedida no ecrã de entrada ou pelo gestor.

#### Regra de ouro do isolamento por profissional

A classificação de clientes é feita por profissional, nunca por barbearia. Um
cliente que deixou de vir ao Carlos pode estar a ser atendido pelo Rui. Se o
painel do Carlos o mostrar como perdido, o dado é falso e o barbeiro perde a
confiança no sistema. A classificação usa a vista `cliente_por_profissional`
(C.4), e o RLS garante que cada barbeiro só vê as suas marcações, visitas e
clientes (C.5).

#### Indicadores próprios

- Faturado hoje, com o número de serviços concluídos.
- Previsão do dia: o agendado e ainda não atendido.
- Faturado no mês e percentagem do objetivo individual (Pro).
- Falta para o objetivo do dia.
- Ticket médio do próprio barbeiro.
- Taxa de regresso dos seus clientes.

#### Agenda própria

- Só as marcações dele; ausências marcadas.
- Lembrete individual por marcação, assinado com o nome dele. «Lembretes em lote» no Pro.
- Vagas livres dele, para encaixar um cliente sem marcação («Marcar ao balcão» só para si).
- Concluir e marcar falta nas suas marcações.

#### Clientes próprios

- Lista dos clientes dele (os que marcou ou atendeu, e os que registou ao balcão), por estado.
- Ficha técnica dos seus clientes.
- Mensagem individual e em lote (Pro), assinadas com o nome dele, enviadas do WhatsApp do dispositivo dele.

#### Metas e acerto

- Objetivo mensal definido pelo gestor; barra de progresso e valor necessário por dia; histórico de seis meses (Pro). No Basic, a chamada de upgrade.
- «A minha folha de acerto» (F.4.11): leitura, com o sinal certo conforme o modelo.

### E.4 · Camada 4 — Cliente final (página pública e Minha área)

O cliente chega pela página pública (E.6). Vê a barbearia, os serviços e os
preços, e marca **sem precisar de conta**. A conta é opcional e dá acesso à área
de cliente: selos, histórico, próxima marcação, clube e encomendas.

Fronteira: o cliente vê apenas os seus dados. Não existe caminho — nem por
menu, nem por endereço — para dados de outro cliente ou da barbearia.

#### Marcação

1. **Serviço.**
2. **Barbeiro**, se a barbearia tiver mais de um ativo: primeiro nome, fotografia, portfólio (quando visível) e «Sem preferência», que entrega a marcação a quem estiver livre.
3. **Dia e hora**: só as vagas que `vagas_livres()` devolve, com o preço; nas horas mortas, o preço normal riscado e o preço com desconto.
4. **A vaga fica reservada por 10 minutos** (`reservar_vaga()`), com a contagem visível. Se o tempo acabar, a vaga é libertada e o cliente volta ao passo 3.
5. **Dados:** nome, telemóvel (máscara portuguesa de nove dígitos), e-mail (opcional: «para receber a confirmação»), data de nascimento (opcional: «para receber os parabéns»), código de convite (opcional) e a caixa de consentimento para mensagens promocionais, desmarcada por omissão. Por baixo, **«Criar acesso à minha área» com palavra-passe (opcional)**: se o número for novo na barbearia, a conta fica criada logo; se já tiver ficha, a confirmação diz «Para criar o acesso, peça o código na sua área» (F.9).
6. **Confirmação** (`confirmar_reserva()`): resumo com serviço, barbeiro, data, hora e valor; «Adicionar ao calendário»; e-mail de confirmação quando há e-mail e `confirmacao_email` está ligada.

Mensagens de recusa, sempre em linguagem corrente: vaga ocupada entretanto,
reserva expirada, marcação online bloqueada por faltas («Fale com a
barbearia»), limite de três marcações futuras.

O cliente que já marcou antes, com sessão iniciada, vê **«Repetir o último
serviço»**: o mesmo serviço e o mesmo barbeiro, no primeiro horário livre (`marcacao_rapida`).

#### Acesso à área de cliente (B9)

- **Entrar:** telemóvel e palavra-passe.
- **Número novo:** a palavra-passe escolhe-se na primeira marcação (acima); não há código.
- **Criar acesso para um número que já tem ficha, ou esqueci-me da palavra-passe:** o cliente escreve o telemóvel e pede um código. O ecrã diz: «A barbearia vai enviar-lhe um código de 6 dígitos por WhatsApp. O código é válido durante 15 minutos.» Fora do horário: «Receberá o código quando a barbearia abrir.» A resposta é igual exista ou não o número.
- O código aparece no painel da barbearia (E.2, Pedidos de acesso), que o envia por wa.me.
- Com o código certo, o cliente define a palavra-passe; a rota `api/acesso` cria ou atualiza a conta (B.6).
- Cinco tentativas por código; três pedidos por hora.

#### Minha área

- Cartão de selos, com os completos a dourado, barra de progresso, quantos faltam e o nome do prémio (quando ativo).
- Próxima marcação, com «Cancelar» até à antecedência definida (por omissão, 2 horas antes).
- Histórico: serviço, barbeiro, data e valor.
- Plano do clube: nome, próxima renovação, consumo do mês por serviço.
- Encomendas da loja e o estado.
- O código de convite pessoal, para partilhar.
- Botões: marcar, repetir o último serviço, falar no WhatsApp, ligar.

### E.5 · Relatório mensal

O documento que o dono e cada barbeiro consultam no fim do mês. Existe nos dois
painéis, com o mesmo motor de cálculo e o mesmo gerador de PDF, com âmbitos
diferentes: o gestor vê a barbearia, o barbeiro vê o que produziu. É o principal
argumento de renovação.

**Não é enviado por e-mail** (DECISOES D-11): consulta-se no painel e
descarrega-se em PDF.

#### Onde vive

- No painel da barbearia, aba «Relatório», entre o Financeiro e a Gestão do sistema.
- No painel do profissional, aba «O meu relatório».
- Abre com o mês corrente.

#### A barra de controlo

| Elemento | Comportamento |
| --- | --- |
| Seletor de mês | Setas pelos últimos doze meses; o mês por extenso |
| Exibir relatório | Recalcula e mostra |
| Descarregar relatório | Gera o PDF no servidor (`api/relatorios`) com a marca da barbearia |

#### Os nove blocos

| N.º | Bloco | O que mostra | Camada |
| --- | --- | --- | --- |
| 1 | Resumo do mês | Faturação com variação face ao mês anterior, resultado e margem, clientes atendidos, perdidos e recuperados | Ambas |
| 2 | Evolução da faturação | Barras dos seis meses, com o mês do relatório destacado | Ambas |
| 3 | Desempenho por profissional / O meu desempenho | Faturação, serviços, ticket médio, objetivo atingido e comissão | Gestor / Profissional |
| 4 | Serviços | Quantidade, receita e peso de cada serviço | Ambas |
| 5 | Retenção de clientes | Recuperados, ligações abertas, clientes novos, ativos e em risco | Ambas |
| 6 | Fidelização | Selos atribuídos, cartões completos, prémios resgatados, convites | Ambas |
| 7 | Financeiro | Receita própria (modelo A), rendas de cadeira (C), parte da casa recebida (B), comissões pagas, custos, despesas, resultado com margem. Com as funcionalidades ativas, linhas do clube (mensalidades recebidas, subscritores, créditos por usar) e da loja (receita sem IVA, custo, margem, produtos abaixo do mínimo) | Gestor |
| 8 | Operação | Taxa de faltas, ocupação média, melhor e pior dia, antecedência média das marcações | Ambas |
| 9 | O que fazer no próximo mês | Até quatro recomendações com valores em euros (F.5) | Ambas |

#### O bloco que vende o sistema

O bloco 5 fecha com a caixa **«O sistema pagou-se sozinho»**, que compara a
faturação recuperada com o valor da subscrição no mesmo período.

- **Recuperada** = valor cobrado das visitas de clientes que estavam «em risco» ou «perdidos», feitas até 30 dias depois de uma mensagem de recuperação aberta para eles.
- No Basic, sem mensagens, a caixa mostra os clientes que voltaram sozinhos e a chamada de upgrade.
- Os dois números são sempre calculados, nunca escritos à mão.

```
Recuperou 167,20 € em clientes que não voltavam.
A subscrição do sistema custou 47,97 € (com IVA) no mesmo período.
```

#### O gerador de PDF

- Um só gerador para as duas camadas: recebe o âmbito e devolve o documento.
- Cabeçalho escuro da Performa LAB, barra na cor da barbearia, logótipo; paginação em todas as páginas.
- No painel do profissional, o título identifica o barbeiro e o documento não inclui o financeiro da barbearia.
- Nome do ficheiro: `Relatorio-<mes>-<ano>-<nome>.pdf`, em ASCII.
- Rodapé: «Relatório de gestão. Não é documento fiscal.»

#### Regra de consistência dos números

Todos os valores vêm do mesmo cálculo que alimenta o resto do painel. Um
relatório com uma faturação diferente da do Início destrói a confiança no
sistema. Uma só função por indicador, usada por todos os ecrãs.

### E.6 · A página pública — a porta de entrada

A página pública é o endereço principal de cada barbearia e a porta de entrada
das três pessoas que a usam: o cliente que quer marcar, o gestor e o barbeiro.
É também a página que os motores de busca encontram. Lê só das vistas
`publico_*` e das funções públicas (C.3, C.4).

#### A capa é o cabeçalho

A página não tem barra branca por cima com o logótipo pequeno. A capa é o
cabeçalho, e a marca vive dentro dela.

```
┌──────────────────────────────────────────────┐
│  Barbearia Exemplo                  [ Entrar ] │
│  Rua da Demo, 12 · Viseu                     │
│                                              │
│  [ BARBEARIA EM VISEU ]        ╭──────────╮  │
│                                │          │  │
│  ┌──────────────────────────┐  │    BJ    │  │
│  │ Faça a sua marcação      │  │  VISEU   │  │
│  └──────────────────────────┘  │          │  │
│  ┌──────────────────────────┐  ╰──────────╯  │
│  │ Fale connosco            │                │
│  └──────────────────────────┘                │
│  ┌──────────────────────────┐                │
│  │ Prefere ligar?           │                │
│  └──────────────────────────┘                │
│                                              │
│  ● Aberto agora · fecha às 19:30             │
└──────────────────────────────────────────────┘
```

No computador, duas colunas: à esquerda as três ações, à direita o logótipo em
grande, com um halo suave. No telemóvel, o logótipo sobe e as ações ficam por
baixo, com a largura toda.

#### As três ações, sempre à vista

| Ação | Peso | O que faz |
| --- | --- | --- |
| Faça a sua marcação | Botão principal, na cor da marca | Abre o fluxo de marcação |
| Fale connosco | Botão verde | Abre o WhatsApp da barbearia |
| Prefere ligar? | Botão discreto, com o número | Inicia a chamada |

Além da capa, as três ações ficam numa barra fixa no fundo do ecrã enquanto a
página rola. Se a barbearia estiver fechada no interruptor, «Faça a sua
marcação» dá lugar a «Marcações temporariamente indisponíveis».

#### O logótipo dentro da capa

Em círculo, com o nome e a localidade por baixo, sobre dois anéis concêntricos
discretos e um halo da cor da marca. A cor da capa é escolhida pelo dono a
partir do logótipo. O texto sobre a capa é branco ou preto conforme o
contraste, com o mínimo de 4,5 para 1.

#### A barra fina ao rolar

Quando a capa sai do ecrã, sobe uma barra fina com o logótipo pequeno, o nome,
«Entrar» e «Marcar».

#### A entrada das três pessoas

«Entrar», no cabeçalho, abre a escolha:

| Escolha | Vai para | Entra com |
| --- | --- | --- |
| Sou o gestor | InstaBarber Gestão (`/app`) | E-mail e palavra-passe |
| Sou o barbeiro | InstaBarber Equipa (a área dele) | E-mail e palavra-passe |
| Sou cliente | Minha área desta barbearia | Telemóvel e palavra-passe, ou pedido de código |

Os três acessos repetem-se no rodapé, em texto.

#### O que a página mostra por baixo da capa

Cada bloco aparece só se tiver conteúdo e se a funcionalidade estiver ativa:

- **Serviços:** nome, descrição, duração e preço final (com IVA, se o houver); um toque começa a marcação.
- **Promoções em vigor.**
- **Os barbeiros:** primeiro nome, fotografia e portfólio.
- **A história**, quando o dono a escreveu.
- **Onde estamos:** mapa e ligação para o Google Maps.
- **Horário**, com aberto ou fechado no momento.
- **Loja:** produtos ativos, com «esgotado» quando o dono assim quer.
- **Contactos:** WhatsApp, telefone, redes sociais.
- **Rodapé:** Política de Privacidade, Termos, Livro de Reclamações eletrónico (obrigatório, H.2), ligação para avaliar no Google, e os três acessos.

#### A fidelização não aparece nesta página

O cartão de selos e o prémio vivem só na área de cliente. Uma página pública
que prometesse «dez selos, um corte grátis» anunciaria uma oferta que a
barbearia pode ter desligado.

#### A página é indexável

Título com o nome e a localidade, descrição com os serviços principais, e dados
estruturados `HairSalon` (schema.org) com morada, horário e serviços com preços.
A área de cliente, os painéis e o fluxo de marcação têm `noindex`.

#### Idiomas

Com `multilinguagem` ligada, a página e a área de cliente seguem a I.3.2.
