## Parte C · Modelo de dados

O esquema completo vive em `docs/esquema/`, como SQL executável e testado. Esta
Parte explica-o. **Em caso de diferença, vale o SQL.** O esquema foi validado a
21 de outubro de 2026 num PostgreSQL 16 limpo: os quatro ficheiros aplicam-se de
uma vez e os 389 testes passam.

### C.1 · Princípios do esquema

- **Um só esquema, quatro ficheiros, por esta ordem:** `01_tabelas.sql`, `02_funcoes.sql`, `03_rls.sql`, `04_dados_iniciais.sql`. Na Fase 1 copiam-se para `supabase/migrations/` sem alterações.
- **Identificadores só em ASCII**: `marcacoes`, `servicos`, `pedidos_adesao`. Nunca acentos.
- **Todas as tabelas operacionais têm `inquilino_id`.** As referências entre tabelas do mesmo inquilino usam chaves compostas `(inquilino_id, id)`: uma marcação da barbearia A não pode, fisicamente, apontar para um barbeiro da barbearia B.
- **O histórico nunca se reescreve.** Comissão, percentagem, modelo de caixa, custo e IVA ficam gravados no momento (`visitas`, `pedido_linhas`); acertos liquidados não se alteram; selos são um livro de movimentos.
- **Datas em `timestamptz`** (UTC). A hora de Lisboa calcula-se só nas funções `hora_local()` e `instante_lisboa()`.
- **Dinheiro em `numeric(10,2)`.** Os preços de serviços, clube e cartões são o valor final ao cliente; os produtos guardam custo sem IVA, taxa e preço com IVA.
- **Nada se apaga em cascata quando tem valor financeiro.** Clientes não se apagam: anonimizam-se (`anonimizar_cliente()`). Um serviço, cliente ou profissional com histórico não se apaga (`ON DELETE NO ACTION`). A única exceção é eliminar uma barbearia cancelada inteira, no fim do contrato (`eliminar_inquilino()`).

### C.2 · Mapa das tabelas

| Domínio | Tabelas | Regras que importam |
| --- | --- | --- |
| Barbearias | `inquilinos` | Campos protegidos (plano, estado, cobrança, domínio, slug) só o super_admin altera — gatilho `proteger_inquilino`. Slugs reservados na própria tabela |
| Pessoas da equipa | `perfis`, `profissionais`, `horarios_profissional`, `ausencias` | O cliente não tem perfil. Um utilizador pode ter perfis em várias barbearias. O barbeiro só altera nome apresentado, foto e portfólio — gatilho `proteger_profissional`. O número de profissionais ativos nunca passa o contratado |
| Calendário | `feriados` | Nacionais com `inquilino_id` nulo, carregados pela plataforma; cada barbearia acrescenta os seus (municipal, Carnaval, dias fechados) |
| Serviços | `servicos`, `comissoes_servico` | Nomes e descrições em PT obrigatórios; EN e FR opcionais. Comissão por serviço substitui a de omissão do profissional |
| Clientes | `clientes`, `fichas_tecnicas`, `codigos_acesso` | Um cliente por telefone (E.164) e por barbearia. Consentimento com data. `auth_user_id` só depois de verificado o código (B.6) |
| Agenda | `marcacoes` | Estados: `reservada`, `agendada`, `concluida`, `falta`, `cancelada`. A restrição `sem_sobreposicao` trava duas marcações ativas sobrepostas para o mesmo profissional; canceladas e faltas libertam o horário |
| Serviços prestados | `visitas`, `movimentos_selos` | A visita só nasce por `concluir_marcacao()` e guarda base, percentagem e valor da comissão, modelo de caixa e emitente |
| Clube | `clubes`, `clube_servicos`, `subscricoes`, `ciclos_clube`, `creditos_clube` | Um ciclo por período pago; o pagamento regista-se (`pago_em`, `metodo`). Créditos só valem em ciclos pagos e em curso |
| Cartões oferta | `cartoes_oferta`, `movimentos_cartao` | Vendidos ao balcão; o saldo é o valor inicial menos os usos (vista `saldo_cartoes`) |
| Preço e montra | `periodos_desconto`, `promocoes`, `portfolio_fotos` | Até seis fotografias por barbeiro |
| Filas | `fila_espera`, `fila_presencial` | Um cliente uma vez por serviço e dia; prazos por `expira_em`, sem tarefas agendadas |
| Loja | `produtos`, `pedidos_loja`, `pedido_linhas` | O stock só desconta em `levantar_pedido()` |
| Mensagens | `mensagens` | WhatsApp: `preparada` → `ligacao_aberta` → `envio_confirmado_manualmente`. `enviado`/`falhou` só existem no e-mail |
| Financeiro | `custos_fixos`, `despesas`, `objetivos`, `acertos` | Objetivo com profissional nulo = da barbearia. Acerto liquidado não se reescreve; corrige-se com um acerto `correcao` |
| Grelha | `funcionalidades`, `pacote_funcionalidades`, `inquilino_funcionalidades` | Só o super_admin escreve. `mostra_upgrade` diz quais aparecem com a chamada de upgrade (D.3) |
| Plataforma | `pedidos_adesao`, `faturas_plataforma`, `recebimentos`, `auditoria`, `limites_pedidos` | A palavra-passe nunca entra no pedido. Faturas da Performa LAB com o número do seu programa certificado |
| Desligados (G.4) | `modulos_plataforma`, `inquilino_modulos`, `ligacoes_externas`, `pagamentos`, `documentos_fiscais` | Só o super_admin. Nenhuma tabela anterior depende destas |

### C.3 · As funções que gravam

O TypeScript chama estas funções por RPC e nunca reimplementa a regra.

| Função | Quem chama | O que faz |
| --- | --- | --- |
| `vagas_livres(inquilino, servico, dia, profissional?)` | Público, equipa | Vagas do dia com preço e desconto (F.7) |
| `validar_vaga(...)` | Equipa | Motivo de recusa, ou nulo se a vaga é válida |
| `calcular_preco(inquilino, servico, inicio)` | Público, equipa | Valor de tabela, desconto de hora morta e valor cobrado |
| `reservar_vaga(...)` | Público | Prende a vaga 10 minutos e devolve um token |
| `confirmar_reserva(...)` | Público | Com o token, cria ou encontra o cliente e passa a `agendada` |
| `cancelar_minha_marcacao(...)` | Cliente com conta | Respeita a antecedência de cancelamento |
| `concluir_marcacao(marcacao, modo, valor?)` | Gestor, barbeiro da marcação | Modo `normal`, `credito_clube` ou `premio`; grava a visita, a comissão e os selos |
| `marcar_falta(marcacao)` | Gestor, barbeiro da marcação | Depois da hora marcada |
| `entrar_fila_espera(...)`, `entrar_fila_presencial(...)` | Público | Com as funcionalidades ligadas |
| `criar_pedido_loja(...)`, `levantar_pedido(...)` | Público / equipa | Total calculado na base; stock só ao levantar |
| `submeter_pedido_adesao(jsonb)` | Público (via rota com limite) | Recusa qualquer campo de palavra-passe |
| `pedir_codigo_acesso(...)` | Público | Gera o código, que aparece à equipa para envio por wa.me; resposta igual exista ou não o número |
| `verificar_codigo_acesso(...)` | Só servidor (chave de serviço) | Valida o código (15 min, 5 tentativas, uso único) |
| `procurar_cliente_por_telefone(...)` | Equipa | Procura exata, para marcar ao balcão |
| `anonimizar_cliente(cliente)` | Gestor, super_admin | Direito de eliminação (H) |
| `consumir_limite(chave, máximo, janela)` | Só servidor (chave de serviço) | Limites de pedidos nas entradas públicas (F.6) |
| `pode_criar_acesso_direto(cliente)` | Só servidor (chave de serviço) | Se um número novo pode escolher a palavra-passe na primeira marcação, sem código (F.9) |
| `aplicar_pacote(inquilino)` | Super_admin | Marca as funcionalidades do plano (aprovação e «Repor pacote») |
| `eliminar_inquilino(inquilino, slug)` | Super_admin | Apaga uma barbearia cancelada e todos os dados; devolve as contas de autenticação a apagar (manual, P-18) |

As funções `security definer` têm `search_path` vazio. A execução é retirada a
todos e dada só a quem consta da tabela.

### C.4 · Vistas

- **Públicas** (`publico_inquilinos`, `publico_servicos`, `publico_profissionais`, `publico_portfolio`, `publico_produtos`, `publico_promocoes`, `publico_periodos_desconto`): a única forma de o anónimo ler dados. Só barbearias ativas, só colunas seguras (sem NIF nem dados de cobrança), e respeitam as funcionalidades ligadas.
- **Internas**, com as permissões de quem consulta: `saldo_selos`, `saldo_cartoes`, `cliente_por_profissional` (base da classificação por profissional, F.1).

### C.5 · Matriz de acesso (RLS)

Todas as tabelas do esquema `public` têm RLS ativo. Resumo por papel; o
detalhe está em `03_rls.sql`. O super_admin, com dois fatores, lê todas as
tabelas (vista de apoio e exportação dos dados de uma barbearia que sai).

| Área | Anónimo | Cliente | Profissional | Proprietário | Super_admin |
| --- | --- | --- | --- | --- | --- |
| Barbearia (`inquilinos`) | Vista pública | Vista pública | Lê a sua | Lê e altera (sem campos protegidos) | Tudo |
| Equipa, horários, ausências | Vista pública | Vista pública | Lê; altera nome, foto e portfólio próprios | Tudo na sua | Tudo |
| Serviços e comissões | Vista pública | Vista pública | Lê serviços e as suas comissões | Tudo na sua | Tudo |
| Clientes e fichas | — | A sua ficha | Os seus clientes | Todos os da sua | Leitura |
| Marcações e visitas | Funções públicas | As suas | As suas | Todas as da sua | Leitura |
| Selos | — | Os seus | Dos seus clientes | Lê e ajusta | — |
| Clube | — | O seu plano | Lê | Tudo na sua | — |
| Loja | Vista e função | Os seus pedidos | Lê, marca pronto, levanta | Tudo na sua | — |
| Mensagens | — | — | As que abriu | Todas | — |
| Financeiro e acertos | — | — | Os seus objetivos e acertos | Tudo na sua | — |
| Grelha de funcionalidades | — | — | Lê | Lê | Escreve |
| Adesões, faturas, auditoria | Função de adesão | — | — | Lê as suas faturas | Tudo |
| Módulos desligados (G.4) | — | — | — | — | Tudo |

Uma barbearia suspensa perde o acesso aos dados; o dono continua a ver a ficha
da barbearia e as faturas, para regularizar.

### C.6 · Testes obrigatórios

`docs/esquema/testes` contém cinco conjuntos que correm na Fase 1 e antes de
cada entrega (`npm run test:sql`):

- `10_isolamento.sql` — 81 testes: duas barbearias, cinco papéis, leitura, escrita, funções e Storage.
- `20_agenda.sql` — 54 testes: horário, almoço, ausências, feriados, horário próprio, janela, reservas, expiração, concorrência, cancelamentos e os dois dias de mudança de hora.
- `30_regras.sql` — 66 testes: comissão, clube, prémio, convite, faltas, loja, acertos, limite de profissionais, código de acesso, limites de pedidos, alteração de plano, fila de espera, acesso direto, leitura do super_admin, eliminação de uma barbearia, anonimização.
- `50_financas.sql` — 76 testes: custos, contas a pagar e estado efetivo, metas, lembretes de vencimento (WhatsApp e e-mail, estados e recusas), vista dos vencimentos, isolamento por papel e eliminação da barbearia.
- `40_comercial.sql` — 112 testes: NIF, numeração, leads do site (duplicados e limite), funil, propostas e validade, contratos e assinatura, convites de adesão, isolamento por papel e retenção.

Nenhuma fase de segurança se considera concluída pela existência das políticas:
os testes correm e o resultado mostra-se.

### C.7 · Storage

| Bucket | Caminho | Quem escreve | Quem lê |
| --- | --- | --- | --- |
| `publico` | `<inquilino_id>/…` (logótipo, capa, galeria, produtos) | Proprietário | Todos |
| `publico` | `<inquilino_id>/portfolio/<profissional_id>/…` | O barbeiro e o proprietário | Todos |
| `fichas` | `<inquilino_id>/<cliente_id>/…` | Proprietário; barbeiro para os seus clientes | Os mesmos |
| Adesão | URL assinado criado pela rota `api/adesoes` | Formulário | Super_admin |

Formatos e tamanhos das imagens: D.8.1.

### C.8 · Tarefas da plataforma sobre os dados

- **Feriados nacionais:** carregados até 2028 em `04_dados_iniciais.sql`. A Performa LAB acrescenta o ano seguinte antes de 1 de dezembro (M.1).
- **Reservas expiradas:** libertam-se sozinhas na marcação seguinte do mesmo profissional; não precisam de tarefa agendada.
- **Tipos TypeScript:** `npm run db:types` depois de cada migração.
