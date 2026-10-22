## Parte P · Roteiro de expansões (dormente)

> **Esta Parte não se executa.** Não faz parte das nove fases nem das fases 3B e 3C.
> Só se lê quando o dono mandar ativar uma expansão, com uma frase clara: «ativa a
> Espanha», «ativa o Brasil», «ativa o MB Way online». Antes disso, nenhuma sessão a
> abre (CLAUDE.md, §1). O que aqui está foi **preparado** na base e **documentado**,
> mas nada está ligado.

---

### P.0 · Como usar este documento

1. O dono diz qual expansão quer ativar.
2. Ler, por ordem: P.1 (o que está preparado), P.2 (onde o produto ainda é português),
   P.3 (o procedimento comum) e **só** a secção da expansão pedida (P.4 a P.8).
3. Responder à lista de **perguntas ao dono** dessa secção. Sem respostas, não se começa.
4. Criar um ficheiro de fase novo, `fases/fase-x-<expansao>.md` (por exemplo `fase-x-espanha.md`),
   no mesmo formato das outras: resumo, ficheiros, verificação. Esperar a confirmação do dono,
   como em qualquer fase (CLAUDE.md, §4).
5. O manual de expansões do dono (Fase 9, `docs/manuais/`) é a versão operacional desta Parte; atualiza-se a cada ativação.
6. No fim, registar em `DECISOES.md`, atualizar `PROGRESSO.md` e dar nova versão no índice.

**O que nenhuma expansão pode fazer:** código por país ou por barbearia (regra 2), custo
variável por mensagem (regra 5), uma segunda aplicação (regra 1). Cada país é
**configuração** (dados, textos, regras em tabelas) e, no máximo, uma base de dados
adicional com o mesmo código (P.5).

**Decisão do dono (21/10/2026):** a preparação está confirmada e as dúvidas jurídicas e contabilísticas tratam-se só quando se ativar cada expansão, não antes.

**Os pareceres jurídicos e fiscais não se inventam.** Cada secção diz o que tem de ser
confirmado por um profissional local. Tudo o que está marcado «a confirmar» é hipótese de
trabalho, não aconselhamento.

---

### P.1 · O que está preparado hoje

| Preparação | Onde | Estado |
| --- | --- | --- |
| País, fuso, moeda e idioma de cada barbearia | `inquilinos.pais`, `fuso`, `moeda`, `idioma` (01_tabelas.sql, secção 1) | Existem, com os valores de Portugal por omissão. Cada restrição só aceita hoje esse valor: ativar um país alarga a restrição (P.3). Testes em `testes/60_expansao.sql` |
| Telefones em formato internacional | `telefone` e `whatsapp` com `^\+[1-9][0-9]{7,14}$`; `lib/formatacao/telefone.ts` (E.164) | Pronto. A ligação `wa.me` já usa o número sem o «+» |
| Textos fora dos componentes | `lib/i18n/` (CLAUDE.md, §5): nenhum texto visível em literais | Regra desde a Fase 1. Um ficheiro por idioma; `pt-PT` é a base |
| Preços e IVA em configuração | D-45 (`PRESTADORA_REGIME_IVA`, `propostas.iva_taxa`, `calcularPrecoCent`) | Pronto para um regime de IVA diferente; falta a moeda (P.3) |
| Pagamentos e faturação | Módulos desligados da G.4 (`lib/pagamentos`, `lib/faturacao`) | Prontos para ligar com um fornecedor (P.7) |
| Vocabulário da vertical | `lib/vertical/barbearia.ts` | Pronto para outras verticais (fora do âmbito desta Parte) |
| Domínios defensivos | `.es`, `.eu`, `.online` (L.1) | Registados. `.com.br` **não** está |

---

### P.2 · Onde o produto ainda é português

Inventário dos pontos que mudam quando se ativa outro país. É a lista de trabalho.

| Área | Onde está | O que muda |
| --- | --- | --- |
| Fuso | `lisboa()`, `lisboa_para_utc()`, `hoje_lisboa()` e mais seis ocorrências de `'Europe/Lisbon'` em `02_funcoes.sql`; duas vistas em `01_tabelas.sql` | Passar a ler `inquilinos.fuso`. As funções de data passam a receber o inquilino. Altera a regra 6: ver P.3, passo 5 |
| Formatação | `lib/formatacao/datas.ts`, `dinheiro.ts` | Receber `idioma` e `moeda` por parâmetro. Nunca `Intl` com valores fixos |
| NIF | `nif ~ '^[0-9]{9}$'` em `inquilinos`, `clientes`, `contratos`, `leads` e outras | Passar a campo de identificação fiscal genérico, com validação por país (NIF, NIF/CIF/NIE, CNPJ/CPF, etc.) |
| Código postal | `codigo_postal ~ '^[0-9]{4}-[0-9]{3}$'` | Validação por país |
| Feriados | Tabela `feriados` (nacionais com `inquilino_id` nulo) | Acrescentar `pais` e, para Espanha e Brasil, região ou município. Carga anual por país |
| Textos | `lib/i18n/` | Novo ficheiro por idioma. Os painéis hoje só existem em `pt-PT` |
| Preços | D.1 e `04_dados_iniciais.sql` | Tabela de preços por país e moeda |
| Contratos e propostas | `docs/comercial/` | Modelos novos por país, revistos por jurista local. Não se traduz o português |
| Privacidade e termos | Parte H, política do site e da plataforma | Texto por país: RGPD e leis nacionais; LGPD no Brasil |
| Landing | `landing/index.html` | Uma página por país, não uma tradução: «Feito em Portugal», distritos, telefone e moeda mudam |
| Prestadora | `PRESTADORA_*` no `.env` | Uma prestadora por país onde se vende (P.4, P.5) |
| E-mail | Resend, endereços `@instabarber.pt` | Remetentes por país, se o domínio mudar |
| Mensagens | Textos de `wa.me` e dos e-mails | Por idioma. O canal (P.6) pode mudar por país |

---

### P.3 · Procedimento comum para ativar um país

Cada passo tem um critério de saída. Não se passa ao seguinte sem ele.

1. **Decisão do dono e das perguntas da secção do país.** Saída: respostas escritas, em `DECISOES.md`.
2. **Parecer profissional** (jurista e contabilista do país): contrato, privacidade, IVA ou
   equivalente, e quem é a entidade que fatura. Saída: pareceres arquivados em `docs/expansao/<país>/`.
3. **Registo de marca** no território (P.4 a P.6). Saída: pesquisa de anterioridades feita.
4. **Migração do esquema** (nova versão em `docs/esquema/`, primeiro lá, com testes):
   alargar os `check` de `pais`, `fuso`, `moeda` e `idioma`; campo fiscal e código postal por
   país; `feriados.pais`; tabela de preços por país. Saída: testes SQL a passar, incluindo um
   que prova que Portugal **não mudou** de comportamento.
5. **Fuso por barbearia.** As funções de data passam a usar `inquilinos.fuso`. Isto altera a
   regra 6 («zero cálculos de data fora de Europe/Lisbon») para «zero cálculos de data fora do
   fuso da barbearia, por omissão Europe/Lisbon». A alteração só se faz neste passo e com ordem do
   dono. Saída: testes de agenda a passar com duas barbearias em fusos diferentes e a mudança de hora.
6. **Textos.** Novo ficheiro em `lib/i18n/`, escrito à mão por quem fala o idioma (nunca só
   tradução automática). Saída: nenhum texto em falta (teste que compara as chaves) e revisão humana.
7. **Dados de arranque:** feriados do ano, serviços de exemplo, preços. Saída: carregados e conferidos.
8. **Documentos e landing** do país (P.2). Saída: aprovados pelo dono e pelo jurista.
9. **Piloto fechado** com 2 a 3 barbearias reais, antes de abrir. Saída: uma semana de uso sem
   falhas de agenda, sem erros de data e com o dono satisfeito.
10. **Abertura** e registo em `PROGRESSO.md`.

**Teste de não regressão obrigatório:** a suite SQL de Portugal (389 testes de base) e os
critérios de aceitação J.1 têm de passar sem alterações antes e depois de cada ativação.

---

### P.4 · Espanha

**Ponto de partida.** O mercado mais próximo: WhatsApp muito usado, idioma próximo, mesmo
fuso base (com as Canárias à parte), mesma moeda.

| Item | Hipótese de trabalho (a confirmar com profissional espanhol) |
| --- | --- |
| Idioma | `es-ES`. Escrito à mão. Cataluña e outras regiões podem querer línguas próprias: fora do âmbito inicial |
| Moeda e fuso | EUR. `Europe/Madrid`; `Atlantic/Canary` nas Canárias |
| Identificação fiscal | NIF, NIE ou CIF (9 caracteres alfanuméricos). Código postal de 5 dígitos |
| IVA | O IVA espanhol do serviço, a confirmar. Venda a empresas de outro Estado-Membro da UE: regras de inversão do sujeito passivo, com validação do número de IVA (VIES). **A confirmar com contabilista** se a Prestadora (isenta em Portugal) pode ou deve faturar a clientes espanhóis |
| Feriados | Nacionais e por comunidade autónoma; alguns locais |
| Leis | RGPD e a lei espanhola de proteção de dados; lei dos serviços da sociedade da informação para comunicações comerciais; legislação sobre condições gerais de contratação. **Jurista espanhol** revê contrato e privacidade |
| Faturação | Se um dia o módulo de faturação for ligado, a faturação espanhola tem requisitos próprios para software (a confirmar). Enquanto o produto só **regista** e não fatura (CLAUDE.md, §3), não se aplica |
| WhatsApp | Canal principal. `wa.me` igual |
| Marca | Pesquisa no registo da UE e no espanhol |
| Entidade | A confirmar: a Prestadora portuguesa a faturar para Espanha, ou entidade local |

**Perguntas ao dono antes de ativar**
1. Quem fatura em Espanha (a Prestadora, uma entidade nova)?
2. Preço igual ao de Portugal, ou ajustado ao mercado?
3. Há barbearias espanholas conhecidas para o piloto?
4. Quem escreve e revê os textos em espanhol?
5. Apoio: em que horário e idioma?

**Trabalho técnico (resumo).** P.3 completo. Textos `es-ES`; NIF/NIE/CIF e código postal; feriados por
comunidade; landing própria; contrato e privacidade espanhóis. Estimativa: **5 a 7 dias** de Claude Code,
mais o tempo dos pareceres, que é o caminho crítico.

---

### P.5 · Brasil

**Ponto de partida.** O dono é brasileiro, conhece o mercado e tem pessoas para o piloto. O pai tem uma
empresa de TI no Brasil, que poderia ser a entidade que contrata e fatura. É o país com mais diferenças:
não é só traduzir, é outro enquadramento legal, fiscal, de pagamentos e de concorrência.

| Item | Hipótese de trabalho (a confirmar com profissionais brasileiros) |
| --- | --- |
| Idioma | `pt-BR`, **ficheiro próprio, escrito por quem fala**. Não se reutiliza o `pt-PT` (regra 4 mantém-se para Portugal) |
| Moeda e fuso | BRL. Vários fusos (`America/Sao_Paulo`, `America/Manaus`, outros). É a razão pela qual o fuso é por barbearia |
| Identificação | CPF e CNPJ; CEP de 8 dígitos (`#####-###`) |
| Dados pessoais | LGPD, não RGPD: base legal, direitos do titular, encarregado (DPO), política própria. Jurista brasileiro |
| Entidade | A empresa de TI do pai, se o objeto social (CNAE) abranger licenciamento ou desenvolvimento de software e o regime tributário o permitir. **A confirmar com contador:** impostos sobre serviços (município), regime tributário, emissão de nota fiscal de serviço |
| Consumidor | Um pequeno empresário (por exemplo, MEI) pode ser tratado, em certos casos, com proteção semelhante à do consumidor. **Jurista brasileiro** deve avaliar o contrato e as cláusulas de saída e reembolso |
| Pagamentos | Pix é o meio dominante, além de cartão e boleto. O produto continua a só **registar** (CLAUDE.md, §3); Pix online só com o módulo de pagamentos ligado (P.7). Os métodos de pagamento da barbearia ficam como lista configurável, com Pix incluído |
| Faturação | A nota fiscal de serviço é emitida pela **entidade** que fatura ao cliente, fora do produto. A plataforma continua a dizer «Não é documento fiscal» |
| Base de dados | Recomendado um **segundo projeto Supabase** na região de São Paulo, com o mesmo código e as mesmas migrações. Latência menor e arrumação legal mais simples. É uma implantação, não uma segunda aplicação (regra 1). Decisão do dono em P.3, passo 4 |
| Alojamento | Vercel com função na região mais próxima disponível, a confirmar |
| Domínio | `.com.br` (por registar). Landing própria em `pt-BR`, sem «Feito em Portugal» |
| WhatsApp | Canal principal. `wa.me` igual; o telefone com `+55` |
| Feriados | Nacionais, estaduais e municipais |
| Marca | Pesquisa no INPI. O registo da UE **não** cobre o Brasil |
| Concorrência | Mercado com produtos locais estabelecidos. Fazer pesquisa antes de fixar o preço |

**Perguntas ao dono antes de ativar**
1. Confirma que a empresa do pai pode ser a entidade (objeto social, regime, disponibilidade do pai)?
2. Como se divide a relação entre as duas entidades (Performa LAB em Portugal e a empresa no Brasil): licença da marca e da plataforma? Isto precisa de contador e jurista dos dois países.
3. Preço em reais: tabela própria? Quais os planos?
4. Quantas barbearias para o piloto e em que cidade?
5. Quem presta o apoio e em que horário?
6. Faz sentido uma landing e um site separados (domínio próprio)?

**Trabalho técnico (resumo).** P.3 completo mais: texto `pt-BR`, CPF/CNPJ e CEP, métodos de pagamento
configuráveis, `Intl` em `pt-BR` com BRL, projeto Supabase em São Paulo, página própria. Estimativa:
**7 a 10 dias** de Claude Code, mais pareceres e abertura da operação, que são o caminho crítico.

---

### P.6 · Outros países da Europa

Para Itália, França, Alemanha, Países Baixos, Polónia e outros, o procedimento é o P.3. Cada país
exige o seu quadro abaixo preenchido **antes** de se estimar o trabalho. Notas de partida, todas
**a confirmar** localmente:

| País | Idioma | Moeda | Canal de mensagens | Pontos a verificar |
| --- | --- | --- | --- | --- |
| Itália | it-IT | EUR | WhatsApp forte | Faturação eletrónica obrigatória (quem fatura); identificação fiscal; contrato |
| França | fr-FR | EUR | WhatsApp e SMS | Menções legais obrigatórias no site; regras de software de caixa, se um dia houver pagamentos |
| Alemanha | de-DE | EUR | WhatsApp menos dominante; SMS | Identificação do prestador no site (Impressum); requisitos de software de caixa, se um dia houver pagamentos |
| Polónia | pl-PL | PLN | WhatsApp médio | Moeda diferente do euro: preços, IVA e arredondamentos |

Antes de cada um:
1. Há barbeiros reais a quererem pilotar? Sem eles, não se ativa.
2. Quem escreve, revê e presta apoio no idioma?
3. O canal de mensagens certo é o `wa.me`? Se não, o modelo de mensagens (F.4.10) tem de ser revisto, sem custo variável por mensagem (regra 5).

---

### P.7 · MB Way online (pagamentos em Portugal)

**O que é.** O cliente da barbearia paga a marcação ou o serviço online com MB Way. Hoje o produto
só **regista** pagamentos (CLAUDE.md, §3). Ativar isto muda essa regra de base e a G.4.

**Passos prévios obrigatórios**
1. **Quem recebe o dinheiro.** O dinheiro do cliente tem de ir **diretamente para a conta da
   barbearia**, através de um prestador de pagamentos autorizado. A plataforma **não detém fundos
   de terceiros** (isso exigiria uma licença própria). Parecer jurídico sobre o enquadramento.
2. **Escolha do prestador** que suporte MB Way e o modelo acima (por exemplo, os operadores
   nacionais de pagamentos ou um prestador internacional com MB Way; **a confirmar** quais suportam
   o fluxo e as comissões no momento). Critérios: comissão, liquidação direta, webhooks, reembolsos,
   documentação em português, suporte.
3. **Custos.** A comissão por transação é do prestador e é paga pela barbearia. Não é custo por
   mensagem (regra 5), mas é um custo variável novo: tem de ficar escrito no contrato e na grelha D.3.
4. **Fatura.** Se o fluxo passar a emitir faturas, usar **programa certificado** (via AT) por
   integração com um fornecedor, nunca desenvolver faturação própria. O módulo de faturação da G.4
   fica ligado ao fornecedor.
5. **Alterar o CLAUDE.md** (regra «não processa pagamentos nem emite documentos fiscais»), a Parte G
   (G.4), a H (conformidade), a D (grelha) e os termos, **só** com ordem do dono.

**Trabalho técnico**
- `lib/pagamentos`: adaptador do prestador escolhido, atrás da interface que já existe (G.4).
- Rota `api/webhooks/pagamentos` (hoje 404 com o módulo desligado): assinatura verificada, idempotência
  (cada evento processado uma só vez), estados do pagamento e reconciliação.
- Pagamento por marcação: sinal, total ou depósito (a decidir), reembolso na falta e no cancelamento
  (F.8).
- Chaves do prestador só em `.env.local` e no cofre da Vercel (regra 7). Se faltarem, **parar e pedir**.
- Testes com o adaptador simulado; um teste mostra que, com o módulo desligado, nada muda.
- Cada barbearia liga o pagamento online ao seu ritmo (interruptor `inquilino_modulos`).
- Estimativa: **8 a 12 dias** de Claude Code, mais a contratação do prestador.

**Perguntas ao dono antes de ativar**
1. Sinal ou pagamento total na marcação?
2. Quem suporta a comissão: a barbearia ou o cliente?
3. A barbearia tem de ter conta num prestador próprio?
4. Faturação: o cliente pede fatura com contribuinte? Qual o fornecedor certificado?
5. Quando um cliente falta ou cancela, o sinal reembolsa-se?

---

### P.8 · Outros métodos de pagamento e canais

O padrão de P.7 repete-se: **Pix** (Brasil, com P.5), **Bizum** (Espanha, com P.4), cartões e carteiras
nos outros países. Cada um é um adaptador novo atrás da mesma interface de `lib/pagamentos`, ligado por
país e por barbearia. Sem exceções: o dinheiro vai diretamente para a barbearia, as chaves nunca entram
no repositório, e há parecer local antes de ligar.

---

### P.9a · Catálogo de atualizações

As ativações e outras mudanças futuras têm número fixo em `docs/atualizacoes/catalogo.md` (as ativações de países são as U-04, U-05 e U-07, o MB Way é a U-06). O dono pede-as por número e o Claude Code segue o protocolo de `docs/atualizacoes/README.md`.

---

### P.9 · O que se faz agora e o que fica para a ativação

| Já feito ou a fazer nas fases normais | Só na ativação |
| --- | --- |
| Colunas `pais`, `fuso`, `moeda` e `idioma` com testes (feito) | Alargar as restrições e ligar outros valores |
| Textos fora dos componentes, em `lib/i18n/` (Fase 1 em diante) | Escrever os idiomas novos |
| Telefone em formato internacional (já na especificação) | Validação por país |
| D-45: IVA e preço em configuração | Moeda e IVA de outros países |
| Módulos de pagamentos e faturação desligados (G.4) | Fornecedores, webhooks, chaves e regras legais |
| Esta Parte P | A fase `fase-x-<expansao>.md` de cada ativação |

---

### P.10 · Ordem sugerida

Portugal primeiro, até haver barbearias a pagar. A seguir, o que o dono decidir. A ordem de menor
a maior esforço é, em regra: MB Way online (só Portugal) → Espanha → Brasil → outros países da
Europa. O Brasil tem a vantagem do conhecimento do mercado e da empresa do pai, mas é o que
exige mais trabalho jurídico e fiscal. A ordem final é do dono.
