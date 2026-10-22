## Parte M · Operação e suporte

Construir o sistema é metade do trabalho. A outra metade é mantê-lo a
funcionar com clientes reais a depender dele.

### M.1 · Rotina de operação

| Frequência | Tarefa | Porquê |
| --- | --- | --- |
| Diária | Ver pedidos de adesão novos e aprovar | Uma barbearia que espera dois dias perde o entusiasmo |
| Diária | Ver os erros registados | Uma falha silenciosa num sábado à noite custa clientes |
| Semanal | Rever leads parados e propostas a expirar (Comercial, P-21) | Um contacto que espera uma semana arrefece |
| Semanal | Cópia externa da base de dados (manual do operador, P-13) | É a proteção contra perda de dados |
| Semanal | Rever barbearias com pouca utilização (M.2) | Quem não usa, cancela |
| Mensal | Emitir as faturas da Performa LAB no programa certificado e registar os recebimentos | A cobrança é manual, por decisão de produto |
| Mensal | Rever as mensalidades em atraso | Antes de chegar à suspensão |
| Semanal | Vencimentos dos próximos 7 dias: enviar lembretes (P-25) | Evita atrasos antes de chegarem à suspensão |
| Mensal | Registar custos e contas do mês e rever o objetivo (P-26) | Saber o lucro e o ponto de equilíbrio |
| Mensal | Apagar leads sem contrato com mais de 12 meses (P-24) | Retenção de dados pessoais (H.1) |
| Trimestral | Rever preços e planos | O mercado e os custos mudam |
| Anual (até 1 de dezembro) | Carregar os feriados nacionais do ano seguinte | As datas da Páscoa e do Corpo de Deus mudam |

O relatório mensal de cada barbearia não se envia: a barbearia descarrega-o
no painel (DECISOES D-11).

### M.2 · Sinais de alerta numa barbearia

Os sinais que precedem um cancelamento. Vê-los antes, não depois.

- Não abre o painel há mais de dez dias. É o sinal mais forte e o mais fácil de medir.
- Não tem marcações novas há mais de uma semana.
- Nunca carregou o logótipo nem personalizou a marca.
- Nunca abriu uma mensagem de recuperação (Pro) ou nunca viu o radar (Basic).
- Ficou suspensa por falta de pagamento e não voltou a contactar.
- Mais profissionais contratados do que ativos: paga por algo que não usa.

Para cada sinal, um contacto previsto: uma chamada ou uma mensagem pessoal a
perguntar o que falta, nunca uma mensagem automática genérica.

### M.3 · Suporte a uma barbearia

```
NÍVEL 1 — Utilização (a maioria dos casos)
  Não consigo entrar; esqueci-me da palavra-passe.        → ligação de recuperação por e-mail
  O meu barbeiro não recebeu o convite.                    → «Reenviar convite» na Gestão do sistema
  Um cliente não recebe o código.                          → ver «Pedidos de acesso» no Início
  Não sei como registar um serviço.                        → guia rápido ou chamada de cinco minutos

NÍVEL 2 — Configuração
  O horário está errado e a agenda não abre as horas certas.
  Quero mais um profissional.  Quero mudar do Basic para o Pro.
                                                           → o administrador ajusta no painel

NÍVEL 3 — Técnico
  Marcação duplicada para o mesmo profissional.  Erro ao gravar.  Dados em falta.
                                                           → investigar na auditoria, corrigir,
                                                             dizer ao cliente o que aconteceu e o que foi feito

REGRA: um problema de nível 3 num sábado à noite vale mais do que dez
melhorias. A confiança perde-se numa noite e ganha-se em meses.
```

### M.4 · Suspender sem perder dados

Quando uma barbearia não paga, suspende-se o acesso, nunca os dados.

- A suspensão (estado `suspenso`) corta o acesso da equipa aos dados (o RLS deixa de os mostrar) e tira a página pública das marcações. O dono continua a ver «O meu plano» e as faturas, para regularizar.
- A página pública mostra um aviso neutro: «Temporariamente indisponível para marcações». Não expõe a razão.
- Ao reativar, tudo volta como estava, incluindo as marcações futuras.
- Após 12 meses de suspensão sem contacto, e cumprindo a política de conservação, os dados podem ser eliminados. O cliente é avisado antes, por escrito, e recebe a exportação dos dados (manual do operador, P-18).

### M.5 · Como dar suporte sem te afogares

A partir de vinte a trinta barbearias, o suporte começa a competir com as
vendas pelo teu tempo.

- Uma página de ajuda com as dez perguntas mais frequentes, em vídeos de um minuto.
- Resolver no painel de administração em vez de ensinar: acrescentar um barbeiro é um clique.
- Um vídeo de boas-vindas gravado para cada barbearia nova, com o painel dela.
- Só a partir de trinta clientes vale a pena um assistente a meio tempo.

### M.6 · Quando ocorrer uma violação de dados

O RGPD dá ao responsável pelo tratamento 72 horas para notificar a Comissão
Nacional de Proteção de Dados. O plano tem de estar escrito antes de ser preciso.

```
1. Conter: cortar o acesso, revogar chaves comprometidas, fechar a exposição.
2. Avaliar: que dados, de quantas pessoas, que risco real.
3. Registar: hora da descoberta, causa, dados afetados, ações tomadas.
4. Informar as barbearias afetadas sem demora injustificada. A notificação à CNPD
   em 72 horas é delas, como responsáveis pelo tratamento; a Performa LAB dá-lhes
   a informação de que precisam.
5. Informar os titulares, se o risco for elevado (decisão do responsável).
6. Corrigir a causa e registar o que mudou.
```

Manter um documento com este plano, os contactos e o registo de incidentes. É
exigido pelo RGPD e demonstra diligência numa inspeção.

### M.7 · Evolução do produto depois do lançamento

Cada passo só se justifica quando o anterior está estável.

1. Corrigir tudo o que os clientes reportarem. Nenhuma funcionalidade nova compete com um erro por resolver.
2. Cópia externa automática, se um dia a cópia semanal à mão deixar de chegar (exige autorizar uma tarefa agendada).
3. Notificações push no telemóvel do barbeiro (exige a dependência `web-push`).
4. O assistente de contas automatizado, quando o número de clientes pesar no teu tempo.

**Plano dos 50 clientes** — gatilho: 50 barbearias ativas a pagar.

1. Escolher o fornecedor de pagamentos (D-05) e ativar o MB WAY (G.4): sinal nas marcações, cobrança do clube e cobrança automática das mensalidades InstaBarber.
2. Ativar a faturação por programa certificado ou portal (G.4), depois do parecer do contabilista.
3. Avaliar certificar o próprio InstaBarber na AT.
4. Multi-loja.
5. Reserva a partir do Google.
6. O agente de atendimento no WhatsApp, vendido como serviço à parte: tem custo por conversa e exige preço próprio. Não faz parte do Pro nem substitui as ligações `wa.me`.
7. O marketplace entre barbearias, quando houver escala para ele ter conteúdo.

### M.8 · Manual do operador

Os processos manuais da Performa LAB estão escritos, passo a passo, no
`docs/manual-do-operador.md`: da proposta comercial e da aprovação de uma
barbearia à cópia de segurança, ao restauro e à saída de uma barbearia. Serve
para qualquer pessoa conseguir operar a gestão do InstaBarber sem depender de
quem a construiu.

O manual escreve-se já, a partir da especificação. Na Fase 8 é revisto com o
sistema real: cada procedimento é feito uma vez, os passos corrigem-se e
acrescentam-se as capturas de ecrã. Qualquer mudança no produto que mexa num
procedimento atualiza o manual no mesmo dia.

### M.9 · Regras de qualidade em todas as fases

**Nunca deixar código morto.** Quando uma funcionalidade sai, sai por
completo: função, componentes, rotas, estilos, tipos e testes. Depois de
remover, procurar o nome em todo o projeto. A única exceção é o código
desligado por interruptor, com testes e registado no `DECISOES.md` (G.4).

**Validar antes de entregar.** `npm run typecheck`, `lint`, `test`,
`test:sql` e `build` sem erros. O `typecheck` apanha o que a leitura deixa
passar.

**Uma funcionalidade, um só gerador.** Quando um valor é calculado em mais do
que um sítio, os sítios divergem. Cada cálculo relevante vive numa função —
SQL ou `lib/regras` — e todos os ecrãs a usam.
