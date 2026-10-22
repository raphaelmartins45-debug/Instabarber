## Parte F · Regras de negócio

Duas casas para as regras, nunca as duas para a mesma regra:

- **Na base de dados** (`docs/esquema/02_funcoes.sql`), as regras que decidem o que se grava: vaga válida, preço com desconto, comissão, selos, crédito do clube, stock, faltas, código de acesso. O TypeScript chama-as e não as reimplementa.
- **Em `lib/regras`**, funções puras com testes Vitest para o que se calcula e mostra: classificação de clientes, objetivos, mensalidade, acertos, recomendações, texto das mensagens wa.me.

### F.1 · Classificação de clientes

Cada cliente tem uma frequência habitual: a média dos intervalos entre visitas
consecutivas, ignorando intervalos superiores a 180 dias (interrupção, não
padrão). A classificação compara os dias desde a última visita com essa média.

| Estado | Condição | Ação sugerida |
| --- | --- | --- |
| Ativo | Dias sem vir abaixo de 1,5 × a frequência | Mensagem de pós-venda |
| Em risco | Entre 1,5 e 2 × a frequência | Convite a regressar |
| Perdido | Acima de 2 × a frequência | Campanha de reativação |
| Sem histórico | Nenhuma visita concluída | Sem classificação |

- **Com uma ou duas visitas**, usa-se a frequência de 30 dias por omissão. O cliente que veio uma vez há quatro meses é «perdido» — e é o grupo maior, por isso não pode ficar de fora (DECISOES D-22).
- **No painel do barbeiro**, só conta o histórico com esse barbeiro (`cliente_por_profissional`). **No painel do gestor**, conta o histórico com a barbearia inteira: um cliente que trocou de barbeiro não está perdido para a barbearia.
- **Faturação a recuperar** (estimativa): soma, para os clientes perdidos, do ticket médio de cada um multiplicado por 0,4 — a probabilidade estimada de regresso após contacto. O fator vive em `lib/regras/classificacao.ts` e é o mesmo da F.5.
- Clientes anonimizados ou com «não contactar» não entram nas listas de mensagens, mas contam para os totais.

### F.2 · Fidelização por selos (`fidelizacao_selos`)

- Cada serviço concluído credita um selo. Os selos são um livro de movimentos (`movimentos_selos`); o saldo é a soma (`saldo_selos`). Nada se reescreve.
- O número de selos necessários é configuração do gestor, por omissão 10.
- O resgate consome os selos necessários e **o excedente transita** (DECISOES D-24).
- O resgate faz-se ao concluir o serviço do prémio, no modo `premio` de `concluir_marcacao()`: o serviço entra como prestado, com valor cobrado zero, e o movimento guarda o serviço e o valor de tabela do prémio naquele momento.
- O serviço feito com o prémio não credita selo.
- Com a funcionalidade desligada, os selos deixam de se creditar; os que existem ficam.
- O saldo aparece na ficha do cliente, na agenda (ao concluir) e na área de cliente.

#### F.2.1 · O prémio

O prémio do cartão completo é decidido pelo dono na Gestão do sistema: se está
ativo, e qual é — escolhido da lista de serviços ativos, nunca escrito à mão.
Por omissão, o serviço de menor preço. Com o prémio ativo, só esse serviço pode
ser resgatado com selos. Com o prémio desativado, o cartão conta selos, não
anuncia nada, e o gestor decide o que dar quando o cartão completa.

O prémio aparece na área de cliente, com o nome exato do serviço. É o cliente que
o pede ao balcão; não há mensagem a anunciá-lo.

### F.3 · Objetivos

- O objetivo mensal é definido por barbearia e por profissional (Pro), no Financeiro.
- Objetivo diário = objetivo mensal ÷ dias de funcionamento do mês, excluindo dias de descanso, feriados nacionais (quando a barbearia fecha nos feriados), feriados próprios e dias de ausência da barbearia inteira.
- Valor em falta = objetivo − faturado acumulado, nunca abaixo de zero.
- Valor necessário por dia restante = valor em falta ÷ dias de funcionamento que faltam.
- Alterar um objetivo reflete-se de imediato na camada Equipa.

#### F.3.1 · Desconto de aniversário (`campanha_aniversario`)

Decisão do dono, na Gestão do sistema: se está ativo e de quanto é. Sem ele, a
campanha é só a lista de aniversariantes do mês (clientes com data de
nascimento).

A mensagem de aniversário é sempre uma felicitação, em nome do barbeiro que a
abre. **Nunca menciona o desconto.** Quem comunica o desconto é o barbeiro, ao
balcão: a plataforma não promete ao cliente o que a barbearia ainda tem de
cumprir. Quando ativo, o desconto aparece na lista como nota interna.

Abrir a mensagem é do Pro (`envio_mensagens`); a lista existe nos dois planos.

#### F.3.2 · Serviços em três línguas (`multilinguagem`)

- Com a funcionalidade desligada, o formulário de serviços mostra um só nome e uma só descrição. O dono nunca vê campos de outras línguas.
- Ligada, aparecem os campos de inglês e francês ao lado do português, sempre opcionais. Cada campo tem o atalho «copiar do português».
- Nunca há tradução automática. O que o dono não escrever mostra-se em português.
- Na página pública, o cliente em inglês vê `nome_en` quando existe, senão o português. O mesmo para o francês.
- Desligar não apaga os textos; voltam quando se ligar.

### F.4 · Módulos

#### F.4.1 · Fila de espera (`fila_espera`)

Serve para não perder o cliente que quer marcar e não encontra horário.

- O cliente escolhe o serviço, vê que não há vagas no dia e entra na fila (`entrar_fila_espera()`): indica o serviço e o dia, nunca a hora.
- Um cliente fica uma vez na fila do mesmo serviço e dia; se tentar outra vez, vê a posição que já tem.
- Quando uma marcação é cancelada, a barbearia vê a vaga e a fila no mesmo ecrã e abre o aviso por wa.me com um clique (Pro): nome, serviço, o horário que abriu e o prazo.
- **Prazo de resposta: 30 minutos**, gravado em `expira_em` no momento do aviso. Passado o prazo, o barbeiro passa ao seguinte com um botão. Não há tarefa agendada: o estado «expirado» calcula-se na leitura.
- Enquanto o cliente não aceita, a vaga continua livre na página pública. Só fica ocupada quando a marcação é criada; se outro a ocupar entretanto, o sistema avisa o barbeiro.
- A fila de um dia expira no fim desse dia.
- No Basic, a lista existe; o aviso por wa.me mostra a chamada de upgrade.

#### F.4.2 · Clube de assinatura (`clube_assinatura`)

Receita previsível para a barbearia e cliente mensal em vez de ocasional.

Configuração do gestor, na Gestão do sistema:

```
NOME DO PLANO ........... texto, por exemplo «Plano Cabelo»
PREÇO MENSAL ............ preço final ao cliente
SERVIÇOS INCLUÍDOS ...... da lista de serviços ativos, cada um com quantidade mensal
VALIDADE DO CRÉDITO ..... dias, por omissão 30
TRANSITAR CRÉDITO ....... se sim, o não usado passa para o ciclo seguinte
RENOVAÇÃO ............... automática no mesmo dia do mês (dia 29 a 31 passa ao último dia do mês) ou manual
```

- O gestor inscreve o cliente na área do clube; o cliente vê o plano na área dele.
- **O pagamento é registado, não cobrado.** Cada ciclo nasce por registar; ao receber (dinheiro, MB WAY, transferência, cartão), o gestor marca «Pago», e só então os créditos do ciclo valem.
- Ao concluir um serviço incluído, «Usar crédito do clube» chama `concluir_marcacao()` no modo `credito_clube`: o valor cobrado fica a zero, o valor de tabela mantém-se, e o crédito desconta. Sem crédito, o serviço é cobrado normalmente.
- O desconto de hora morta não se acumula com o crédito.
- Planos desativados deixam de aceitar subscrições; os existentes mantêm-se até ao fim do ciclo.
- Cliente que cancela mantém o crédito do ciclo já pago e não renova.
- O serviço com crédito fica atribuído ao barbeiro que o fez, com comissão sobre o valor de tabela (F.4.8). O clube não está ligado a um barbeiro (DECISOES D-12).
- O gestor vê: subscritores ativos, mensalidades recebidas no mês e créditos por usar — crédito não usado é receita recebida e serviço não prestado.
- O clube é um instrumento de recorrência, não de margem por serviço.

#### F.4.3 · Entrada por QR code e clientes não registados (`qr_entrada`)

O código fica afixado à porta, no balcão ou junto ao posto de trabalho, e abre
a página da fila presencial. Dois caminhos:

```
ENTRAR SEM REGISTO      vai direto à fila
CRIAR ACESSO            ganha selos e vê o histórico
```

- «Entrar sem registo» pede nome, telemóvel e a caixa de consentimento (desmarcada). Entra na fila do dia (`entrar_fila_presencial()`) e é atendido por quem estiver livre. Fica uma ficha de cliente, sem conta.
- **Estado em tempo real:** a página mostra a posição na fila e uma estimativa de espera («faltam cerca de 8 minutos»), calculada a partir das marcações por terminar e da duração dos serviços.
- O cliente sem conta pode criar acesso mais tarde pelo código (F.9).
- No painel, «Clientes não registados» aparece como filtro da lista de clientes. Só recebem mensagens promocionais com consentimento.

#### F.4.4 · Loja de produtos (`loja_produtos`)

A loja vive num bloco da página pública e numa aba do painel, com dois
separadores, Produtos e Pedidos. **O pagamento é feito ao balcão, no
levantamento. Não há cobrança online.**

**Indicadores no topo:** produtos ativos; pedidos por preparar («novo»); prontos
a levantar; abaixo do stock mínimo.

**Produtos.** Nome, descrição, fotografia (JPG ou WEBP, até 3 MB), custo sem
IVA (obrigatório), taxa de IVA (6, 13 ou 23 %, por omissão 23; nas Regiões
Autónomas, as taxas regionais), preço de venda com IVA, stock, stock mínimo,
ativo e «mostrar quando esgotado». A lista mostra o estado: EM STOCK, REPOR
STOCK (a amarelo, no mínimo ou abaixo), ESGOTADO (a vermelho).

**Margem**, calculada e mostrada enquanto o dono escreve:

```
preço sem IVA = preço de venda ÷ (1 + taxa de IVA)
margem        = preço sem IVA − custo
margem %      = margem ÷ preço sem IVA × 100

Exemplo, IVA 23 %: custo 6,50 € · preço 12,00 € · sem IVA 9,76 € · margem 3,26 € · 33,4 %
```

A margem calcula-se sempre sobre o preço sem IVA: o IVA não é receita da
barbearia. Margem negativa avisa e marca o produto, mas não bloqueia — vender
abaixo do custo é decisão do dono.

**Pedidos.** Quatro estados: Novo → Pronto → Levantado, ou Cancelado.

| Botão | Efeito |
| --- | --- |
| Marcar pronto | Novo → Pronto; o cliente vê o aviso na área dele |
| Avisar | Abre o WhatsApp do cliente com o aviso de pedido pronto |
| Levantado | `levantar_pedido()`: desconta o stock e regrava custo e IVA da linha |
| Cancelar | Encerra sem entrega |

- A encomenda é feita na página pública com nome, telemóvel e consentimento, com ou sem conta (`criar_pedido_loja()`). Só produtos ativos com stock; o total calcula-se na base de dados com os preços em vigor.
- O stock só muda ao levantar. O custo e o IVA gravados na linha não mudam se o produto mudar depois.
- Desligada a funcionalidade, a aba e o bloco público desaparecem.

#### F.4.5 · Marcação rápida e convite

**Repetir o último serviço** (`marcacao_rapida`). Na área de cliente e na
página pública com sessão iniciada: o mesmo serviço e o mesmo barbeiro, no
primeiro horário livre. O cliente só confirma ou escolhe outra hora.

**Trazer um amigo** (com `fidelizacao_selos`). Cada cliente tem um código
pessoal de seis caracteres (letras maiúsculas e números), gerado no primeiro
acesso à área dele. Quem marca pela primeira vez com esse código fica com
`convidado_por` preenchido; quando conclui o primeiro serviço, quem convidou
ganha um selo. Uma só vez por convidado; um cliente só pode ser convidado uma
vez; ninguém se convida a si próprio.

#### F.4.6 · Portfólio do barbeiro (`portfolio_barbeiro`)

Cada barbeiro tem «Os meus trabalhos»: até seis fotografias, com as regras da
galeria. O bloco nasce desligado e aparece na escolha do barbeiro quando ele
liga «Tornar visível» e há pelo menos uma fotografia visível. A primeira é a
que aparece na lista.

#### F.4.7 · Preços por período de ocupação (`precos_dinamicos`)

O dono define descontos para as horas de pouca procura, sem mexer nos preços
dos serviços: dia ou dias da semana, janela de horas e percentagem (por
exemplo, terça e quarta das 14h às 17h, menos 20 %).

- Dois períodos sobrepostos: vale o de maior percentagem; nunca se somam.
- O desconto calcula-se em `calcular_preco()` e fica gravado na marcação (`desconto_percent`, `valor_cobrado`), seja ela pública ou ao balcão.
- A página pública mostra o preço normal riscado e o preço com desconto.
- Não se aplica a serviços com crédito do clube.
- Faturação e comissões usam o valor efetivamente cobrado.

#### F.4.8 · Comissões por serviço (`comissoes_acertos`)

O dono define, na ficha de cada barbeiro, a percentagem que fica para o
barbeiro: uma de omissão (por omissão 50 %) e, se quiser, uma por serviço. O
painel mostra ao lado o valor em euros sobre o preço do serviço.

**Base da comissão — uma só regra (DECISOES D-25):**

```
base = valor de tabela      quando o serviço sai do crédito do clube
base = valor cobrado        em todos os outros casos (com o desconto de hora morta)
comissão = base × percentagem ÷ 100, arredondada ao cêntimo
```

O barbeiro que prestou um serviço do clube não pode receber zero por o cliente
ter plano. A percentagem e o valor ficam gravados na visita por
`concluir_marcacao()`; mudar as percentagens depois não muda o histórico. Um
barbeiro desativado mantém as comissões geradas.

#### F.4.9 · Cartões oferta (`cartoes_oferta`)

Vendidos e pagos ao balcão; a plataforma regista o cartão e o saldo.

- Ao vender: valor, comprador, beneficiário (opcional), método de pagamento e validade (por omissão, um ano). O sistema gera um código de oito caracteres e um cartão em PDF com a marca da barbearia e a frase «Não é documento fiscal».
- Ao usar: no fecho do serviço ou do pedido, «Pagar com cartão oferta» pede o código e o valor a descontar; grava um movimento. O saldo é o valor inicial menos os usos.
- Cartões expirados ou anulados não aceitam usos.
- A venda do cartão não entra na faturação de serviços; o uso também não reduz a faturação (é um meio de pagamento).

#### F.4.10 · Mensagens por WhatsApp

O envio faz-se por ligação direta `wa.me`, sem API e sem custo por mensagem.
É uma decisão de produto. O InstaBarber prepara a mensagem e abre a conversa
com o texto preenchido; o responsável confirma o envio no WhatsApp. A plataforma
não envia nada sozinha, não confirma entrega e não garante leitura. O estado
`ligacao_aberta` significa só que a ligação foi acionada.

- Formato: `https://wa.me/351XXXXXXXXX?text=` seguido do texto codificado. O número é sempre o do cliente.
- Cada mensagem é personalizada com o nome próprio, os dias sem vir, o último serviço e a data, e a ligação para a página pública. O texto gera-se em `lib/regras/mensagens.ts`.
- Cada clique grava uma linha em `mensagens`: registo da tentativa, nunca prova de envio.
- Cliente com «não contactar», anonimizado ou sem consentimento nunca aparece nas listas de mensagens promocionais (recuperação, aniversário, pós-venda, avaliação). Lembretes de marcação, avisos de fila, de pedido e códigos de acesso são mensagens de serviço e não precisam de consentimento promocional.
- Planos: o lembrete individual existe nos dois; recuperação, aniversário, avaliação e tudo o que é em lote são do Pro.

#### F.4.11 · Comissões e acertos

Calcula o que cada barbeiro tem a receber ou a entregar no fim do mês,
conforme o modelo de caixa. Em Portugal há três formas de o dinheiro entrar
numa barbearia, e cada uma muda o sentido do acerto.

| Modelo | Quem recebe do cliente | Quem fatura ao cliente (G.4) | O que se acerta |
| --- | --- | --- | --- |
| A · A barbearia recebe | A barbearia | A barbearia | A barbearia paga a comissão ao barbeiro |
| B · O barbeiro recebe | O barbeiro | O barbeiro | O barbeiro entrega a parte da casa |
| C · Cadeira alugada | O barbeiro | O barbeiro | O barbeiro paga a renda fixa |

**O modelo é de cada profissional** (`profissionais.modelo_caixa`): o mesmo
espaço pode ter contratados e cadeiras alugadas. O formulário de adesão define
o modelo por omissão; a Gestão do sistema ajusta barbeiro a barbeiro, com
«Aplicar a todos». O barbeiro não escolhe o seu modelo. A plataforma pode
desligar modelos (o C, por exemplo) com sub-interruptores no painel de
administração.

**Como o acerto do mês é montado** (`lib/regras/acertos.ts`, a partir das
visitas concluídas no mês, com os valores gravados):

```
Modelo A   a pagar ao barbeiro   = Σ comissão de todas as visitas
           a receber do barbeiro = 0
Modelo B   a pagar ao barbeiro   = Σ comissão das visitas com crédito do clube
           a receber do barbeiro = Σ (valor cobrado − comissão) das restantes visitas
Modelo C   a pagar ao barbeiro   = Σ comissão das visitas com crédito do clube
           a receber do barbeiro = renda do mês

saldo = a pagar − a receber
sentido = 'a_pagar' se saldo > 0 (a barbearia deve), senão 'a_receber' (o barbeiro deve)
```

Os serviços do clube são sempre devidos ao barbeiro que os fez, em qualquer
modelo: a mensalidade do clube foi recebida pela barbearia.

**Onde o gestor controla.** Financeiro → Comissões e acertos: uma linha por
barbeiro com modelo, serviços, receita, acerto, liquidado e saldo.

```
Barbeiro  Modelo                 Serviços  Receita    Acerto    Liquidado  Saldo
Rafael    A · barbearia recebe      118    2.140,00 €  749,00 €  749,00 €    0,00 €  liquidado
Diogo     B · barbeiro recebe        92    1.758,00 €  615,30 €  400,00 €  215,30 €  a receber
Tiago     C · cadeira alugada        64    1.120,00 €  500,00 €    0,00 €  500,00 €  a receber
```

«Registar acerto» pede data, método (dinheiro, MB WAY, transferência), valor e
nota. O mês fecha quando o gestor regista o acerto. Um acerto liquidado não se
reescreve: corrige-se com um acerto de tipo «correção», de sinal contrário. O
barbeiro vê a sua folha de acerto e o histórico, em leitura.

**Faturação e receita — duas palavras, duas contas (DECISOES D-23):**

- **Faturação de serviços** (Início, objetivos, ticket médio, bloco 1 do relatório): Σ valor cobrado das visitas, todos os modelos. Mede a atividade.
- **Receita da barbearia** (bloco 7): receita própria do modelo A + parte da casa recebida no modelo B + rendas do modelo C + mensalidades do clube + receita da loja sem IVA − comissões pagas.

Uma só função calcula cada uma (`lib/regras/financeiro.ts`). Nota fixa no ecrã:
**«Os acertos são controlo interno. Não substituem faturas nem recibos verdes.»**

#### F.4.12 · E-mails automáticos (`confirmacao_email`)

O único envio automático da plataforma, pelo Resend, e só quando o cliente deu
o e-mail.

- **Confirmação de marcação**, no momento em que é confirmada, com serviço, barbeiro, data, hora, morada, ligação para o calendário e a regra de cancelamento.
- **Não há lembrete por e-mail.** O lembrete é por WhatsApp (F.7), que em Portugal chega a quase todos os clientes; a plataforma não tem tarefas agendadas (DECISOES D-16).
- **Exceção, fora da barbearia:** o Admin pode enviar por e-mail, a pedido do operador e nunca agendado, o lembrete de vencimento da mensalidade a um inquilino (Parte O, D-41). Não passa por `mensagens`: fica em `lembretes_vencimento`.
- Cada envio grava uma linha em `mensagens` (canal `email`, estado `enviado` ou `falhou`) e a data na marcação.
- Remetente da plataforma, com o nome da barbearia; resposta para o e-mail da barbearia.

#### F.4.13 · Pedido de avaliação (`pedido_avaliacao`)

Depois de concluído o serviço, a agenda mostra «Pedir avaliação»: abre o
WhatsApp do cliente com um agradecimento e a ligação para avaliar no Google
(configurada na Gestão do sistema). No máximo um pedido por cliente a cada 90
dias. É do Pro, com consentimento.

#### F.4.14 · Ficha técnica (`ficha_tecnica`)

Notas e fotografias do corte na ficha do cliente (máquina, pente, produtos,
preferências), com data e barbeiro. O barbeiro vê e escreve as fichas dos seus
clientes; o gestor, todas. As fotografias ficam no bucket privado `fichas`. Os
dados de saúde nunca se registam (H.1).

### F.5 · Recomendações do relatório

O bloco final do relatório não é texto fixo. Avaliam-se as regras por esta
ordem e mostram-se as primeiras quatro que se verificarem. Cada uma resulta de
um número presente no relatório.

1. Mais de vinte clientes perdidos: sugerir a campanha, com o valor a recuperar (fator 0,4 da F.1).
2. Um dia da semana abaixo de 50 % de ocupação: sugerir um preço por período nesse dia, com a receita adicional estimada.
3. Ticket médio abaixo do do mês anterior: sugerir a combinação de serviços mais procurada.
4. Cartões de selos completos por resgatar: lembrar que um prémio por usar é uma visita garantida.
5. Objetivo acima de 80 % mas não fechado: o valor necessário por dia útil restante.

Máximo de quatro. Mais do que isso deixa de ser um plano.

### F.6 · Segurança aplicacional

- Toda a escrita passa por Server Action, rota de servidor ou função SQL, com validação Zod antes de chegar à base de dados.
- Nenhuma consulta confia em identificadores enviados pelo browser: o RLS e as chaves compostas confirmam inquilino, utilizador, profissional e cliente.
- **Limites nas entradas públicas**, contados na base de dados por `consumir_limite()` e aplicados na rota ou Server Action antes da função SQL: reservar vaga (10 por hora por IP), adesão (3 por hora por IP e por e-mail, com honeypot), pedido de código (3 por hora por número, na base de dados), encomendas e filas (10 por hora por IP).
- A chave de serviço só é usada em `lib/supabase/servico.ts`, para: criar contas (dono, barbeiros, clientes), verificar o código de acesso, contar os limites de pedidos (`consumir_limite()`, tabela `limites_pedidos`) e criar URLs assinados da adesão.
- Palavras-passe só no Supabase Auth, nunca noutro sítio.
- A vista de apoio do administrador exige justificação e fica em auditoria (E.1).
- Cabeçalhos de segurança: CSP sem `unsafe-eval`, `frame-ancestors 'none'`, HSTS.
- Os erros das funções SQL nunca se mostram ao utilizador como texto técnico (B.5).

### F.7 · Motor de agenda

A autoridade é a base de dados: `validar_vaga()`, `vagas_livres()`,
`reservar_vaga()`, `confirmar_reserva()` e a restrição `sem_sobreposicao`. O
ecrã só mostra o que estas funções devolvem. Os testes estão em
`docs/esquema/testes/20_agenda.sql`.

#### Parâmetros da barbearia

| Parâmetro | Omissão | Efeito |
| --- | --- | --- |
| Abertura e fecho | 09:00–19:30 | O serviço tem de começar e acabar dentro do horário |
| Dias de descanso | Domingo e segunda | Sem vagas |
| Almoço | Nenhum | O serviço não pode tocar o intervalo |
| Fechar nos feriados nacionais | Sim | Feriados próprios fecham sempre |
| Granularidade | 30 min | As vagas começam de 30 em 30 minutos a partir da meia-noite local |
| Intervalo entre marcações | 0 min | Tempo de limpeza depois de cada serviço |
| Antecedência mínima | 60 min | Não se marca online para daqui a menos de uma hora |
| Antecedência de cancelamento | 120 min | O cliente cancela até 2 horas antes |
| Janela de marcação | 60 dias | Não se marca online para além disso |
| Aberto | Sim | Fechado, a página pública não aceita marcações |

#### Uma vaga é válida quando, por esta ordem

| Verificação | Código de recusa |
| --- | --- |
| A barbearia está ativa (e aberta, na página pública) | `barbearia_indisponivel`, `barbearia_fechada` |
| O serviço está ativo e é da barbearia | `servico_invalido` |
| O profissional está ativo e é da barbearia | `profissional_invalido` |
| Página pública: respeita a antecedência mínima e a janela | `antecedencia`, `fora_da_janela` |
| O serviço acaba no mesmo dia | `fora_do_horario` |
| Não é feriado nacional (se a barbearia fecha) nem feriado próprio | `feriado` |
| Com horário próprio do barbeiro: cabe inteiro numa das faixas desse dia. Sem horário próprio: não é dia de descanso, cabe no horário e não toca o almoço | `fora_do_horario`, `dia_de_descanso`, `intervalo_almoco` |
| Não coincide com ausência do barbeiro nem da barbearia | `ausencia` |
| Não se sobrepõe a uma marcação agendada, concluída ou reservada em vigor, contando o intervalo entre marcações | `ocupado` |

Ao balcão (marcação da equipa), não se aplicam a antecedência, a janela nem o
interruptor «aberto».

#### A marcação pública, passo a passo

1. `vagas_livres()` devolve as vagas do dia para um barbeiro ou para todos, com o preço.
2. `reservar_vaga()` prende a vaga **10 minutos** (estado `reservada`, `reservada_ate`) e devolve um token. Em «Sem preferência», escolhe quem tem menos marcações nesse dia; em empate, a ordem da equipa.
3. `confirmar_reserva()` com o token: encontra ou cria o cliente pelo telemóvel (sem nunca reescrever dados existentes), verifica a política de faltas e o limite de três marcações futuras, aplica o código de convite, e passa a `agendada`.
4. Uma reserva não confirmada expira. Não há tarefa agendada: deixa de contar como ocupada e é cancelada na marcação seguinte desse barbeiro.

#### Concorrência

Duas pessoas na mesma vaga ao mesmo segundo: a restrição `sem_sobreposicao`
deixa passar uma e recusa a outra com `ocupado`. A interface mostra «Esta hora
acabou de ser ocupada» e volta às vagas.

#### Mudança de hora

As datas guardam-se em UTC e a grelha calcula-se em hora local de Lisboa, a
partir da meia-noite local. Nos dias de mudança de hora (último domingo de março
e de outubro), as vagas continuam às 09:00, 09:30… locais e o número de vagas é
o de um dia normal. Testado em 25/10/2026 e 28/03/2027.

#### Cancelamentos, faltas e órfãs

- Cancelada ou falta: o horário fica livre de imediato.
- O cliente com conta cancela na área dele até à antecedência de cancelamento; depois disso, só a barbearia. O cliente sem conta liga ou escreve à barbearia.
- Um barbeiro desativado deixa as suas marcações futuras sem profissional; o gestor reatribui-as na Gestão do sistema.

#### Lembrete

O lembrete é por WhatsApp: individual, da agenda, nos dois planos; em lote, no
Pro («Lembretes em lote» percorre as marcações do dia uma a uma). Não há
lembrete por e-mail (F.4.12). A mensagem diz o nome do cliente, o serviço, a data, a hora, o barbeiro e, se a marcação for nesse dia, quantos minutos faltam, calculados em Europe/Lisbon no momento de preparar (D-54).

### F.8 · Política de faltas (`politica_faltas`)

- A equipa marca «Faltou» depois da hora marcada (`marcar_falta()`); antes, não é possível.
- Com a funcionalidade ligada e um limite definido (por omissão 2; 0 desliga), o cliente que acumule esse número de faltas nos últimos 180 dias deixa de poder confirmar marcações online. Ao balcão continua a poder marcar.
- O gestor vê o bloqueio na ficha e pode «Voltar a permitir marcação online»: as faltas anteriores deixam de contar.
- A mensagem ao cliente é neutra: «Para marcar, fale com a barbearia.»
- A taxa de faltas entra no bloco 8 do relatório.
- Sinal ou pagamento antecipado não existe na versão 1 (G.4).

### F.9 · Acesso do cliente

Marcar não exige conta. A conta dá acesso à área de cliente: selos, histórico,
próxima marcação, clube e encomendas (DECISOES D-06 e D-28).

#### Número novo: palavra-passe na primeira marcação

No passo dos dados (E.4), o cliente pode escolher logo uma palavra-passe. A
conta cria-se sem código **só se o número for novo nessa barbearia**: ficha
criada nesta marcação, sem histórico, sem selos, sem plano e sem encomendas
(`pode_criar_acesso_direto()`, chamada pelo servidor com a chave de serviço).
Não há histórico para proteger, por isso não há risco.

#### Número que já tem ficha, ou palavra-passe esquecida: código

Se o número já tem ficha (atendido ao balcão, por QR, importado) ou o cliente
se esqueceu da palavra-passe, a conta cria-se ou recupera-se por um código que
a barbearia envia por WhatsApp:

1. O cliente escreve o telemóvel e pede o código (`pedir_codigo_acesso()`). A resposta é igual exista ou não o número.
2. Se o número é de um cliente da barbearia, o código de 6 dígitos aparece no painel da barbearia em «Pedidos de acesso», válido 15 minutos.
3. Alguém da equipa carrega em «Enviar código por WhatsApp»; abre-se o wa.me para o número do cliente com o código escrito.
4. O cliente escreve o código e escolhe a palavra-passe. A rota `api/acesso` chama `verificar_codigo_acesso()` com a chave de serviço e cria (ou atualiza) a conta do cliente nessa barbearia.
5. Limites: 5 tentativas por código, 3 pedidos por hora por número, código de uso único.

**Número registado por outra pessoa.** Se alguém criar a conta com o número de
um terceiro, o verdadeiro dono pede «Esqueci-me da palavra-passe», recebe o
código no seu telemóvel e define uma palavra-passe nova: a conta passa a ser
dele. Só quem tem o telemóvel recebe o código.

Cada barbearia tem a sua conta de cliente: quem trabalha numa barbearia não
consegue usar um código para entrar na conta do mesmo cliente noutra. Quem lê o
código no painel já tem acesso à ficha do cliente nessa barbearia; o código não
lhe dá mais do que isso.
