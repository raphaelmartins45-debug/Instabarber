# PROMPT · Redesenho UI/UX de todo o InstaBarber, com foco cirúrgico na camada financeira

Cola isto no Code, numa sessão do ambiente «Instabarber». Está dividido por setores. Executa por ordem; as respostas do dono às perguntas de produto já estão na secção 12. **Prioridade máxima depois da fundação de design: o setor B (engenharia de dados e dashboards financeiros).**

---

## 0 · Papel, objetivo e hierarquia de regras

Assume a perspetiva de **diretor de design de produto + engenheiro front-end sénior**. **Âmbito: SÓ front-end, design visual e experiência de utilização. Back-end e funcionalidades ficam intactos e nada se tira à usabilidade (ver secção 0B).** Vais redesenhar a interface de **todo o InstaBarber**, em todos os painéis, ao nível dos melhores produtos do mundo (Linear, Stripe, Vercel, Apple, Arc, Raycast, Cal.com, Fresha, Squire, Booksy, Vagaro). O objetivo é simples e ambicioso: **o melhor software de gestão de barbearias do mercado mundial, em desenho, fluidez e clareza**, feito em Portugal. Um dono de barbearia tem de abrir o painel e pensar «isto é de outro nível»; um barbeiro tem de o usar de pé, com uma mão, entre dois clientes, sem pensar.

**Usa a Taste Skill.** Carrega `taste-skill` e `redesign-skill` (e `brandkit` só para decisões de identidade). Se não estiverem instaladas nesta sessão, diz-me, que eu envio o pacote. **Hierarquia, por ordem de prevalência:**

1. As minhas instruções explícitas neste prompt.
2. `CLAUDE.md` e `DECISOES.md` (regras do projeto). Em caso de conflito aparente, o `DECISOES.md` decide.
3. A Taste Skill: aplica as suas regras de ofício (hierarquia, ritmo, tipografia, movimento, estados, acabamento), mas **onde uma regra dela contrariar o que peço aqui, ganha o que peço aqui**. Não copies o «gosto da casa» da skill por cima da identidade InstaBarber.
4. A tua própria iniciativa. Decisão de produto não especificada: **pergunta**. Decisão técnica menor: escolhe a mais simples e regista no `DECISOES.md`.

**Fonte visual de verdade:** a landing redesenhada, já em produção (D-109). Abre `landing/index.html` (secção «Redesenho (D-109)» do CSS) e mantém **o mesmo ADN**: cinzentos profundos, um só destaque, bordas de 1 px, vidro, tipografia apertada, números tabulares, movimento contido. O painel é o irmão mais sério da landing, não um primo distante.

## 0B · ÂMBITO E GARANTIA DE NÃO-REGRESSÃO (a regra mais importante deste prompt)

**Isto é um redesenho SÓ de front-end: aspeto visual e experiência de utilização. O back-end fica exatamente como está.**

**Pode mudar (apresentação):** layout, cores, tipografia, espaçamento, ícones, componentes visuais, animações e transições, gráficos (só o aspeto), tabelas e cartões, navegação e casca da aplicação, textos de interface (microcópia), estados vazio/erro/carregamento, acessibilidade, responsividade, desempenho visual.

**NÃO pode mudar, em circunstância nenhuma (back-end e comportamento):**
- Esquema da base de dados, migrações, RLS, funções SQL, restrições, triggers, dados iniciais, testes SQL.
- Repositórios em `lib/repositorios/`, Server Actions, rotas de servidor (`app/api/*`), esquemas Zod, middleware, autenticação, papéis e permissões, interruptores de funcionalidades, regras de planos e preços, configuração e variáveis de ambiente.
- **Lógica e fórmulas de cálculo** (objetivos, comissões, margem, ticket médio, classificação de clientes, selos, stock, mensalidade, IVA): nem uma linha. Os componentes novos **consomem exatamente os mesmos dados e as mesmas funções** que os atuais.
- Estados, regras de negócio, validações, mensagens de erro do servidor e a reatividade (TanStack Query, Zustand, React Hook Form): mantêm-se.

**Usabilidade: nada se tira.** Tudo o que o utilizador consegue fazer hoje, em cada ecrã e em cada camada, **continua a conseguir fazer**, no computador e no telemóvel: cada botão, ação, filtro, campo, atalho, estado, mensagem, exportação e fluxo. Podes **mover, reagrupar, redesenhar e tornar mais rápido**, mas não **remover, esconder atrás de passos extra nem tornar mais difícil**. Se uma ação passar para um menu ou folha inferior, tem de continuar a estar à vista de quem a procura e a ser tão rápida como antes.

**Não inventes funcionalidades.** Várias coisas que descrevo neste prompt são **intenções de desenho**, não funcionalidades novas. Só as constróis se **já existirem** na especificação (Parte E e fases) e nos dados/ações atuais. Se uma ideia exigir dados, ação ou lógica que **não existe** (por exemplo: previsão do fim do mês, comparação com o período anterior, exportação CSV, arrastar para mover marcações, desfazer de 5 s, editor visual da página, pré-visualização de relatório, lista de espera com aviso, upload de foto de talão, nota por voz), **não a implementes**: regista-a numa lista «Sugestões para decidir» e continua. O mesmo vale para qualquer elemento que, para existir, precise de tocar no back-end.

**Como provas que nada se perdeu (obrigatório em cada lote):**
1. **Inventário de paridade funcional**: antes de redesenhar um ecrã, lista todas as ações, campos, filtros, estados e fluxos que ele tem hoje; no fim, mostra a mesma lista com a localização nova de cada item. **Nada pode ficar por mapear.**
2. **Diff de áreas protegidas**: no fim de cada lote, corre `git diff --stat` e prova que **não há alterações** em `docs/esquema/`, `supabase/`, `lib/repositorios/`, `lib/regras/` (exceto helpers puros de apresentação, como a correção de contraste da cor de marca, nunca regras de negócio), `app/api/`, `middleware.ts`, Server Actions e esquemas Zod. Se tiveres de lá mexer, **pára e pergunta**.
3. **Os testes existentes passam sem os alterares** (Vitest, Playwright e SQL). Podes **acrescentar** testes visuais e de componente; **não podes apagar nem enfraquecer** nenhum teste existente para o redesenho passar.
4. **Testes de isolamento entre barbearias a passar**; se falharem, pára tudo.
5. Capturas **antes e depois** de cada ecrã (390 e 1440 px).

---

## 1 · O que NÃO podes partir (regras do projeto que continuam a valer)

- **Stack fechada.** Nenhuma dependência nova sem autorização escrita. Sem Framer Motion, sem cmdk, sem Radix extra além do que o shadcn/ui já traz: movimento em CSS e Web Animations API; paleta de comandos e atalhos feitos à mão.
- **Isolamento por barbearia (RLS), validação da agenda na base de dados, chave de serviço só no servidor.** Este trabalho é de apresentação: **não alteres esquema, políticas, funções SQL nem repositórios** para conseguir um efeito visual. Se achares que um ecrã precisa de dados que não existem, pára e pergunta.
- **Funcionalidade desligada sai do painel** (menu, ecrã, botão, rota). Exceção: as chaves com `mostra_upgrade` aparecem desativadas, com a chamada de upgrade. O desenho tem de ter estes dois estados em cada módulo.
- **Paridade mobile nas quatro camadas.** Nada existe no computador e não no telemóvel. Abaixo de 768 px, tabelas passam a cartões.
- **Todo o dinheiro é registado, nunca cobrado.** Nenhum PDF ou ecrã diz «recibo» ou «fatura»; todos dizem «Não é documento fiscal». Módulos de pagamentos e faturação desligados não aparecem.
- **WhatsApp por ligação `wa.me`:** o sistema prepara a mensagem e abre a conversa; nada aparece como «enviado» sem confirmação manual.
- **Português de Portugal (AO90), sem brasileirismos.** Nunca «piloto», nunca «Performa LAB» em conteúdo de redes sociais. Texto visível só em `lib/i18n/` (base `pt-PT`); nunca `€`, IVA, fuso ou formato de data escritos à mão (vêm de `lib/formatacao`). Rótulos de vertical em `lib/vertical`.
- **Um componente por ficheiro; acima de 200 linhas, dividir. Pastas e rotas em ASCII.** Sem código morto.
- **Não imitar o Instagram** (nem gradiente, nem câmara, nem tipografia). Escrever sempre «InstaBarber».
- **Não leias** o documento mestre, a Parte P, `docs/atualizacoes/`. Lê: `CLAUDE.md`, `DECISOES.md`, `PROGRESSO.md`, `fases/fase-N.md` da fase em curso, `docs/mapa-do-sistema.md` e as secções da Parte E (ecrãs) e da Parte I (identidade) que te indicar o `fases/fase-N.md`.

---

## 2 · Diagnóstico e plano (sem esperar confirmação: ver secção 13)

1. Lê os ficheiros acima e percorre `app/` e `components/` para mapear **todas as rotas e ecrãs que já existem** e os que ainda vão ser construídos nas fases seguintes (usa `docs/mapa-do-sistema.md`, `scripts/gerar-mapa.sh` e `fases/README.md`).
2. Diz-me, com base no `PROGRESSO.md`, **em que fase estamos** e como propões encaixar este redesenho no plano das nove fases **sem o desfazer**. A minha preferência: primeiro a **fundação de design** (setor A), depois **cada fase constrói os seus ecrãs já no desenho novo**; o que já existir é migrado no fim de cada fase. Se discordares, diz porquê.
3. Apresenta o plano em lotes pequenos (cada lote = um branch, um Preview na Vercel, um merge só com o meu «sim»). Estima o esforço de cada lote.
4. As perguntas de produto já estão respondidas na secção 12. Só me perguntas o que **não** estiver lá.

---

## 3 · Setor A · Fundação do sistema de design (primeiro lote)

Tudo o resto depende disto. Constrói uma camada única, em `lib/design/` e na configuração do Tailwind 4 (variáveis CSS no `@theme`), **sem duplicar valores**:

**3.1 Tokens**
- **Superfícies** (escuras por defeito): fundo `#09090B`, cartão `#121214`, cartão elevado `#18181B`, camada `#1F1F23`. Bordas `rgba(255,255,255,.08)` e `.14` em hover. **Nada de preto puro.**
- **Texto:** `#F4F4F5`, secundário `#A1A1AA`, terciário `#71717A`. Contraste mínimo AA (4.5:1) em texto corrente, comprovado.
- **Um só destaque** por contexto. Dois temas de destaque da plataforma, como na landing: **Ouro** `#F5A623` (hover `#FFB63D`, texto sobre ele `#17120A`) e **Neon** `#2DFF8A` (hover `#7DFFB4`, texto sobre ele `#03140A`). Cada um com as suas variantes `--ac-rgb` para brilhos e foco.
- **Semânticas:** sucesso (verde), alerta (âmbar), perda/erro (`#F0786B`), informação (azul frio, só em estados, nunca como destaque). No tema Neon o sucesso coincide com o destaque.
- **Exceção declarada:** as listras vermelha e azul do favicon (D-110) não são paleta de interface.
- **Cor da barbearia (marca do inquilino):** cada barbearia pode ter uma cor de marca (e logótipo). Essa cor está disponível nos painéis dela **como a 3.ª opção de destaque («Marca da barbearia»)** e é a base dos 4 modelos da página pública; em ambos os casos o sistema valida: se o contraste com o fundo ou com o texto sobre o botão ficar abaixo de AA, **corrige automaticamente** (escurece/clareia) e nunca deixa publicar uma combinação ilegível. É um **helper puro de apresentação** (sem tocar em dados nem em regras de negócio), com testes Vitest. **Só se a barbearia já tiver cor/logótipo configuráveis**; se não tiver, usa o tema da plataforma e regista a sugestão.
- **Modo claro: APROVADO.** Desenhado a sério, não é inverter valores: fundo `#FAFAF9`, cartão `#FFFFFF`, cartão elevado `#F4F4F5`, bordas `rgba(9,9,11,.08)`, texto `#09090B`, secundário `#52525B`, terciário `#71717A`. Os destaques ajustam-se ao claro: **Ouro** com texto/ligações em `#B8760A` (AA sobre branco) e botões `#F5A623` com texto escuro; **Neon** com texto/ligações em `#0A8F4B` e botões `#2DFF8A` com texto escuro (o neon puro nunca serve de texto sobre branco). Sombras mais suaves, vidro com fundo `rgba(255,255,255,.7)`. Três estados de modo: **Escuro, Claro, Sistema** (por defeito: Sistema, com o escuro como aparência de referência).
- **Os 3 destaques dos painéis (DECIDIDO).** Em **todos os painéis** (Gestão, Equipa, Minha área, Administração) o utilizador pode escolher entre **três opções de destaque**: **Ouro** (**por defeito**, é a marca InstaBarber), **Neon** e **Marca da barbearia** (a cor do inquilino, com a correção automática de contraste). Combina com os três modos (Escuro, Claro, Sistema): ficam **9 combinações**, todas desenhadas, testadas e legíveis. Um seletor «Aparência» discreto e bonito (popover com pré-visualização viva) no cabeçalho e nas definições. A escolha guarda-se **no dispositivo** (`localStorage`, com `try/catch`) e aplica-se **antes da primeira pintura** (script mínimo no `<head>`, sem piscar). **Só se já existir** um campo de preferência no perfil do utilizador é que também se guarda lá; **não crias campos novos na base de dados**. A opção «Marca da barbearia» só aparece se a barbearia tiver cor/logótipo configurados.

**3.2 Tipografia e números**
- Escala fechada (ex.: 12, 13, 14, 16, 20, 24, 32, 48, 64). Títulos com tracking `-0.02` a `-0.05em`, entrelinha apertada. Corpo 14–16 px, entrelinha 1.45–1.6.
- **Todos os valores financeiros, contagens, horas e percentagens em algarismos tabulares** (`font-variant-numeric: tabular-nums`); números de exibição grandes em peso 700 e tracking apertado. Mono só para códigos (cartão oferta, referências).
- Fonte: Inter (já em uso) com fallback de sistema bem escolhido. Nada de fontes extra sem eu autorizar.

**3.3 Forma, profundidade, movimento**
- Raios 12 / 16 / 24; cartões a 20–24. Sombras em camadas, pequenas e baixas; brilho colorido (`rgba(var(--ac-rgb), …)`) só em elementos de ação ou de sucesso.
- Vidro (`backdrop-filter`) só em camadas flutuantes (menus, painéis laterais, barra de ações, toasts), nunca em todo o lado.
- **Movimento com propósito:** curva `cubic-bezier(.22,1,.36,1)`, 150–250 ms em interações, 400–700 ms em entradas. Entradas escalonadas (60–90 ms), contagem de números, barras que crescem, esqueletos de carregamento que respeitam a forma final. **`prefers-reduced-motion` desliga tudo o que não for essencial.** O script de animação vive isolado (um módulo), nunca misturado com lógica de negócio.

**3.4 Componentes base** (sobre o shadcn/ui, restilizados; um por ficheiro):
Botão (primário com brilho e «shine», secundário, fantasma, perigo, ícone; estados hover/active/focus/disabled/loading), input, select, textarea, interruptor, checkbox, rádio, seletor de data/hora (Europe/Lisbon), campo de dinheiro (cêntimos), **cartão** (padrão, elevado, vidro, destaque), **KPI** (valor tabular, variação, mini-gráfico), tabela (que vira cartões <768 px), lista virtual leve, etiqueta/«chip», badge de plano (Basic/Pro), **chip de upgrade** (para chaves `mostra_upgrade`), separadores, menu, diálogo, folha inferior (mobile), painel lateral, tooltip, toast, esqueleto, estado vazio, estado de erro, barra de progresso, anel de progresso, avatar, linha temporal, gráfico (Recharts restilizado: sem grelha pesada, eixos discretos, cores do sistema, tooltips em vidro, acessível).
- Cada componente com **estados completos** (vazio, a carregar, erro, sem permissão, funcionalidade desligada, funcionalidade em upgrade) e **testes** onde houver lógica.
- Uma **página de catálogo interna** (`/administracao/design`, só para a Performa LAB, atrás de autenticação) que mostra todos os componentes nos dois temas e em 390 / 768 / 1440 px. É a base dos testes visuais.

**3.5 Casca da aplicação (shell)**
- **Desktop:** barra lateral estreita e recolhível (ícones + rótulo), cabeçalho com pesquisa global e ações rápidas, área de conteúdo com largura máxima por ecrã.
- **Mobile:** barra de navegação inferior com 4–5 destinos + botão central de ação (nova marcação), folhas inferiores em vez de modais, gestos naturais (deslizar para avisar/concluir), `safe-area` respeitada, alvos ≥ 44 px.
- **Paleta de comandos** (Ctrl/Cmd + K) feita à mão: ir para ecrã, procurar cliente, nova marcação, abrir radar. Atalhos de teclado nos ecrãs densos (agenda).
- **Chave de tema Ouro/Neon** e, se aprovado, claro/escuro, num sítio discreto e bem desenhado (perfil/definições e atalho no cabeçalho), com a escolha guardada por utilizador.
- Estado de ligação, de sincronização e de «a guardar», sempre visível mas calmo.

**Entrega do lote A:** catálogo + shell + tokens + testes, com capturas Playwright (390, 768, 1440) nos dois temas. **Pára no merge, à espera do meu «sim» (secção 13).**

---


## 3B · Setor B · Engenharia de dados e dashboards financeiros (FOCO CIRÚRGICO, segundo lote)

**Ativa a Taste Skill neste setor com foco cirúrgico.** Os módulos financeiros do InstaBarber são densos (faturado do dono, objetivos diário e mensal do barbeiro, divisão de comissões, despesas, custos fixos, margem, relatórios) e têm de deixar de parecer pesados e estáticos. O resultado tem de ter a limpeza e a precisão de uma interface financeira de topo: pensa **Stripe Dashboard + Linear + Vercel Analytics + Raycast + Apple**.

### Onde mexer (resolve o «caminho do ficheiro»)
O código financeiro **ainda não existe** no repositório: o painel da barbearia (onde vive o financeiro do dono e do barbeiro) é construído na **Fase 4**, e as Finanças da Performa LAB (Parte O) na **Fase 3C**. Por isso **não há nada para «refatorar» já**: constrói estes módulos **diretamente no desenho novo**, e aplica as mesmas regras quando chegares a cada fase. Estrutura obrigatória:
- `components/financeiro/` para a **camada de apresentação** (um componente por ficheiro, máx. 200 linhas): `kpi-bento`, `anel-progresso`, `barra-fina`, `grafico-area`, `tooltip-vidro`, `tabela-faturacao`, `tabela-comissoes`, `etiqueta-estado`, `valor-dinheiro`, `seletor-periodo`, `estado-vazio-financeiro`.
- `lib/regras/` **já contém (ou conterá, nas fases respetivas) a lógica de cálculo**: **este redesenho não a altera nem a duplica**; os componentes só a chamam. Uma regra vive num só sítio.
- **O que decide o que se grava** (preço, comissão, selos, stock) continua nas funções SQL de `docs/esquema/02_funcoes.sql`. **Não duplicas fórmulas no front-end.**
- Dados só via repositórios (`lib/repositorios/`), escrita só por Server Action com validação Zod, estado de servidor em TanStack Query, estado de interface em Zustand. **Nenhum componente fala direto com o Supabase.**
- Dinheiro: `numeric(10,2)` na base de dados, **cêntimos inteiros no TypeScript**, convertidos só em `lib/formatacao/dinheiro.ts`. Datas: só `lib/formatacao/datas.ts` (Europe/Lisbon). Nunca `€`, IVA nem formato de data escritos à mão. Textos em `lib/i18n/`.
- **Regra de ouro:** redesenhas a **apresentação**; as **lógicas de cálculo, os estados e a reatividade ficam intactos** e cobertos por testes. Se uma fórmula precisar de mudar, pára e pergunta.
- Se, ao chegar à Fase 4 ou 3C, já existirem ficheiros financeiros, refatora-os **neste padrão** e mostra-me o «antes e depois» em capturas.

### B.1 · Gráficos minimalistas (Stripe e Vercel)
Usa **Recharts** (já na stack). Nada de biblioteca nova.
- **Remove** linhas de grelha pesadas, eixos poluídos e cores berrantes nos gráficos de faturado e de lucro estimado. Sem grelha vertical; grelha horizontal só em 3 a 4 linhas tracejadas a `rgba(255,255,255,.05)` ou nenhuma; eixos sem linha, só rótulos pequenos e discretos (12 px, cor terciária); sem molduras nem legendas desnecessárias.
- **Linhas de tendência suaves** (`type="monotone"`), traço de 2 px na cor de destaque, com **gradiente por baixo** (`linearGradient` do SVG com `rgba(var(--ac-rgb), .28)` a `0`), ou as variáveis do tema. Ponto ativo com anel e brilho discreto. Linha de comparação (período anterior) a tracejado fino e opacidade baixa.
- **Tooltip personalizado** (`tooltip-vidro`) com **vidro** (`backdrop-filter: blur`, fundo `rgba(18,18,20,.7)`, borda `rgba(255,255,255,.14)`, sombra suave), que **flutua suavemente** com o cursor (transição de posição de 120 a 180 ms), mostra data, valor em euros (algarismos tabulares), variação face ao período anterior e, se fizer sentido, a decomposição (serviços, loja, clube). No telemóvel, **tocar e arrastar** o dedo pelo gráfico; o tooltip fica acima do dedo para não ser tapado.
- **Cursor vertical** fino a acompanhar o ponto. **Animação de entrada** da linha e da área (≈ 700 ms, uma só vez) e transição suave quando o período muda. `prefers-reduced-motion`: sem animação.
- **Acessibilidade:** cada gráfico tem um resumo em texto (`aria-label`/tabela oculta) e não depende só da cor (o «perdido» tem ícone/forma, não só vermelho).
- **Estados:** a carregar (esqueleto com a forma do gráfico), sem dados («Ainda não há movimentos neste período.» + ação), erro, e funcionalidade desligada.
- Mantém o **desempenho**: sem re-renders por movimento do rato (memoizar os dados, isolar o tooltip), sem milhares de pontos (agregar por dia/semana).

### B.2 · Tipografia financeira e geometria de dados (Linear)
- **Obrigatório:** **todos** os valores em euros, percentagens de comissão, ticket médio, contagens e horas usam **algarismos tabulares** (`tabular-nums`) ou `font-mono` onde o desenho pedir (códigos, referências). Os números ficam alinhados na vertical nas tabelas e **não «tremem» quando os dados atualizam**. Alinha à direita as colunas de dinheiro, com a vírgula decimal a alinhar; mostra sempre duas casas nas tabelas e podes omitir os cêntimos nos KPIs grandes (só se os cêntimos forem 00).
- **Métricas principais** (os «291 € parados», o faturado do dia, o lucro do mês, o previsto) com **peso massivo** (`font-bold`/`font-black`, 700 a 800) e **espaçamento fechado** (`tracking-tight`, −0,03 a −0,05 em), tamanho de exibição (40 a 96 px conforme o bloco). O valor em perda ganha um **brilho suave** na cor de perda; o de sucesso, na de sucesso.
- Etiquetas pequenas em maiúsculas com tracking aberto, cor terciária. Unidades (`€`, `%`) mais leves e mais pequenas que o número, sem quebrar a linha (`white-space: nowrap`, espaço fixo).
- **Números que contam:** ao carregar, o KPI conta até ao valor (≈ 800 ms, uma vez); nas atualizações em tempo real, interpola em vez de saltar. Sempre com `tabular-nums` para não mexer a largura.
- Variações com seta e sinal (+/−) e cor semântica, **nunca só a cor**.

### B.3 · Bento Grid de KPIs e indicadores de sucesso (Apple e Raycast)
- **Agrupa os KPIs** (Faturado, Lucro estimado, Despesas, Ticket médio, Serviços feitos, Progresso do objetivo) em **blocos assimétricos de bento grid**: um bloco herói (faturado do período com o gráfico de área dentro), blocos médios (lucro e despesas com mini-gráfico), blocos pequenos (ticket médio, serviços), e o bloco do objetivo. Grelha de 12 colunas no computador, 6 no tablet, 1 no telemóvel com **carrossel de deslize** para os blocos secundários. Cada bloco é um cartão vivo (vidro subtil, borda de 1 px, hover com realce), com título, valor, variação e ação («Ver detalhe»).
- **Substitui as barras de progresso padrão** por: **anéis de progresso circulares minimalistas** (SVG, `stroke-dasharray`, extremidades arredondadas, número tabular no centro, animação fluida de 900 ms, brilho suave) para os objetivos do dia e do mês do barbeiro (ex.: **78 %** em direção ao objetivo do mês, «faltam 54 €»); e **barras finas** (4 a 6 px) com animação fluida (`transform: scaleX`, não `width`, para manter 60 fps) para comparações e linhas de tabela.
- Estados do objetivo: abaixo do ritmo (âmbar), no ritmo, atingido (celebração contida, uma só vez), sem objetivo definido (convite a definir). **Linguagem calma e motivadora**, nunca ansiosa.
- **O dono e o barbeiro veem o mesmo desenho com âmbito diferente**: o barbeiro só vê os seus números; o dono vê a barbearia inteira e pode filtrar por barbeiro. A classificação de clientes segue a regra F.1 (por profissional no painel do barbeiro; pela barbearia inteira no do dono).

### B.4 · Tabelas de faturação e divisão de comissões
- **Cabeçalhos subtis** (`text-muted-foreground`, 12 px, tracking aberto, opacidade reduzida), **linhas de separação submilimétricas** (`border-white/5` no escuro; `border-black/5` se existir modo claro), sem grelhas, sem zebra pesada. Linha ativa/hover com fundo `rgba(255,255,255,.03)`. Cabeçalho **colável** (sticky) com vidro. Ordenação por coluna com indicador discreto. Colunas numéricas à direita, em tabulares; **linha de totais** com peso mais forte e linha fina por cima.
- **Tabela de faturado por barbeiro** e **tabela de divisão de comissões** (faturado, percentagem do barbeiro, comissão, parte da casa, valor a acertar), com **mini-barra** proporcional em cada linha e a percentagem de comissão em tabular. **A conta vem de `lib/regras` e das funções SQL**; a tabela só apresenta.
- **Etiquetas (badges)** elegantes, arredondadas, em **cores pastel/opacas** (fundo `rgba(cor, .12)`, texto na cor, borda `rgba(cor, .25)`) para os estados financeiros. Os rótulos **têm de coincidir com os estados que o esquema e a Parte E definem**; se o esquema usar outros nomes, usa os do esquema e diz-me. Proposta a confirmar: **Pago**, **Pendente**, **Em atraso**, e para comissões **A acertar** e **Acertado**. «Pago» significa **registado ao balcão**: o sistema **nunca cobra**. Cada etiqueta com ícone ou ponto, não só cor.
- **Abaixo de 768 px as tabelas passam a cartões** (um cartão por linha, valor principal à direita em destaque, detalhes em linha secundária, ação «Ver» num toque). Nenhuma coluna ou ação desaparece no telemóvel.
- **Ações de linha** (ver, exportar, acertar comissão) em menu discreto; **acertos em massa** com barra flutuante em vidro. Se o fluxo atual pede confirmação, **mantém a confirmação** (podes redesenhá-la); um «desfazer» só entra se o comportamento já existir.
- **Exportação e relatórios:** relatório mensal em PDF (jsPDF) com a mesma tipografia e grelha, rodapé **«Não é documento fiscal»**, nunca «recibo» nem «fatura». Exportação CSV **só se já existir**. 

### B.5 · Despesas, custos fixos, margem e relatórios
Formulário de despesa rápido (valor em cêntimos, categoria, data, anexar foto do talão via Storage), lista de despesas com as mesmas tabelas, **custos fixos** e **margem do mês** em bloco próprio com explicação de uma linha, comparação com o mês anterior, **previsão do fim do mês** (**só se já existir** na especificação e nos dados; senão, vai para «Sugestões para decidir». Se existir, apresenta com incerteza honesta: «previsto», nunca «garantido»).

### B.6 · Finanças da Performa LAB (Fase 3C, Parte O)
É uma área **interna** (administração): receitas das mensalidades, IVA, custos, margem da Prestadora, propostas e contratos (Parte N). **Mesmo sistema visual, mais denso**, tabelas compactas, KPIs em bento, gráficos de área limpos. **Atenção ao regime de IVA da Prestadora (D-45, `PRESTADORA_REGIME_IVA=normal`):** o preço final é o «com IVA» (39,00 € + 8,97 € = 47,97 €); o valor sem IVA é o preço final ÷ 1,23, arredondado. Nada disto se calcula à mão: vem da configuração e de `lib/formatacao`.

### B.7 · Critérios de aceitação do setor B
- Nenhum gráfico com grelha pesada, eixo poluído ou cor berrante; todos com área em gradiente, tooltip em vidro e resumo acessível.
- **Todos** os números financeiros em tabulares, alinhados; os KPIs não mudam de largura ao atualizar.
- Bento no computador e carrossel no telemóvel; anéis e barras animados, com `prefers-reduced-motion` respeitado.
- Tabelas com cabeçalho subtil, separadores finíssimos, badges pastel; **em telemóvel viram cartões** sem perder nenhuma ação.
- **Testes Vitest** para todas as funções de `lib/regras` (objetivos, comissões, margem, ticket médio, previsão), **testes de componente** para estados (vazio, a carregar, erro, desligado) e **Playwright** em 390 / 768 / 1440 px nos dois temas.
- **Zero alteração** em esquema, RLS, funções SQL e fórmulas existentes. Os testes SQL e os de isolamento continuam a passar.
- Desempenho: INP < 200 ms ao trocar o período; sem salto de layout; gráfico a 60 fps no telemóvel.

**Entrega do lote B:** o módulo financeiro do painel da barbearia (dono e barbeiro) e, se a fase o permitir, o da Performa LAB, com capturas (PC e telemóvel) nos dois temas e um «antes e depois» se já existir código. **Pára no merge, à espera do meu «sim» (secção 13).**

---

## 4 · Setor C · Painel de Gestão (o dono / gestor da barbearia)

Quem usa: o dono, ao balcão e em casa. Quer saber **como vai o dia, quem vem, quanto entrou, quem está a fugir**, e agir num toque. Desenha cada ecrã seguindo a Parte E, mas ao nível de produto de topo.

1. **Início / Painel do dia.** Uma página que responde a «como estamos hoje?» em 5 segundos: faturado vs. objetivo (anel + número grande), marcações de hoje (linha temporal), vagas livres ainda por preencher (com ação «Avisar lista de espera»), clientes em risco (valor em € em destaque, atalho para o radar), contas a pagar, aniversariantes. O **maior elemento visual é o dinheiro em jogo**. Esqueleto de carregamento fiel.
2. **Agenda.** O ecrã mais importante. Vista dia (colunas por barbeiro), semana e lista; **arrastar para mover (só se a ação já existir; usa a mesma mutação atual)**, **tocar numa vaga livre para marcar**, bloqueios e pausas, cores por estado (marcado, confirmado, em curso, concluído, falta) sem depender só da cor. Cartão de marcação com cliente, serviço, preço, tempo até começar e **«Avisar cliente»** (abre `wa.me` com a mensagem pronta; confirmação manual). Nunca permitir um estado impossível: a validação final é a base de dados; a interface mostra o erro de `validar_vaga()` com clareza e sugere a vaga mais próxima.
3. **Clientes.** Lista pesquisável (ficha rápida em painel lateral), classificação (regular, em risco, perdido) com **a regra do gestor: histórico da barbearia inteira** (F.1), histórico, frequência, selos, notas técnicas, ações (marcar, mensagem).
4. **Radar de clientes perdidos** (a funcionalidade-assinatura). Painel isolado de alta fidelidade como o da landing: valor total em risco/perdido como o elemento mais pesado (grande, com brilho subtil), linhas em vidro, cada cliente com há quantos dias não vem, valor estimado e **pré-visualização da mensagem em balão de WhatsApp** ao passar o rato/ao tocar; botão «Enviar mensagem» abre `wa.me`; só passa a «enviada» depois de eu confirmar. Estado «plano Basic» (radar sem mensagem pronta) e «plano Pro» desenhados.
5. **Equipa.** Barbeiros, horários, comissões, objetivos por barbeiro, desempenho comparado (sem humilhar: foco em evolução). Convite por ligação segura.
6. **Financeiro.** Desenhado no **setor B** (lote B, prioritário): bento de KPIs, gráficos de área minimalistas, anéis de objetivo, tabelas de faturação e comissões, relatório em PDF («Não é documento fiscal»). Registo de pagamento ao balcão em dois toques.
7. **Fidelização e Clube.** Selos (10 selos, prémio), clube de assinatura (planos do cliente, ciclo, cortes restantes, quem está por pagar), cartões oferta (código, saldo, validade). O dinheiro regista-se, nunca se cobra.
8. **Loja de produtos.** Produtos **com foto** (moldura clara com cantos redondos, como na landing), stock, estado (em stock, repor, esgotado), pedidos (Novo → Pronto → Levantado), margem sem IVA. A foto usa o mecanismo de carregamento que **já existir**; sem foto, mostra um placeholder elegante.
9. **Mensagens.** Modelos (lembrete, recuperação, aniversário, avaliação Google), pré-visualização em balão, personalização com variáveis, histórico de «preparada / confirmada pelo dono».
10. **Página pública e marca.** Apresentação do editor da página da barbearia **que já existir**, incluindo o seletor dos 4 modelos (setor F) (logótipo, cor, capa, serviços, horários, idiomas PT/EN/FR se a funcionalidade estiver ativa); a pré-visualização ao vivo só se já existir.
11. **Definições, plano e funcionalidades.** Ver plano (Basic/Pro), profissionais, domínio próprio, estado das funcionalidades (sem poder ligar/desligar: só a Performa LAB), chamadas de upgrade honestas.

**Princípios de desenho do Gestão:** densidade controlada (informação rica sem ruído), hierarquia que põe o dinheiro e a ação à frente, tabelas que viram cartões, tudo acessível a um toque, nunca mais de dois níveis de navegação.

---

## 5 · Setor D · Painel da Equipa (o barbeiro)

Quem usa: o barbeiro, **de pé, no telemóvel, com uma mão, entre clientes**. Este painel é **mobile-first** e tem de ser o mais rápido e agradável do mercado.

1. **O meu dia.** Abre direto no que importa: **próximo cliente** em destaque (nome, serviço, daqui a quantos minutos, notas técnicas), seguida da agenda do dia em linha temporal vertical. Deslizar para a direita = «concluir serviço» (+1 selo, regista o pagamento ao balcão); deslizar para a esquerda = «avisar/ reagendar». Vagas livres tocáveis.
2. **Objetivos.** (Mesmo sistema do setor B, âmbito só do barbeiro.) Objetivo de hoje e do mês como anéis/barras animadas (ex.: 78 % do dia, «faltam 54 €»), a minha percentagem do mês, faturado hoje. Linguagem motivadora e calma, nunca ansiosa.
3. **Os meus clientes.** Só os clientes **dele** (classificação por profissional, F.1): regulares, em risco, perdidos, com a ação de mensagem pronta (`wa.me`).
4. **Ficha rápida do cliente.** Em folha inferior: último corte, preferências, notas, selos. Notas técnicas no campo de texto que já existe.
5. **Perfil e disponibilidade.** Marcar folgas e pausas.

**Princípios:** alvos grandes, texto legível ao sol, contraste alto, **zero ecrãs profundos**, funciona bem com luvas de barbearia (mãos molhadas): ações importantes nunca perto do bordo, confirmações por gesto + «desfazer» de 5 s em vez de diálogos.

---

## 6 · Setor E · Minha área (o cliente final)

Quem usa: o cliente do barbeiro, no telemóvel, sem vontade de aprender nada. Identificado por `clientes.auth_user_id`; **nunca herda acesso de equipa**.

1. **Marcar.** Fluxo em três toques: serviço → barbeiro (ou «qualquer») → hora. Só mostra vagas reais. Resumo claro, confirmação com animação sóbria e «adicionar ao calendário». Sem criar conta para marcar; para ver selos e histórico, define palavra-passe por ligação segura (nunca por e-mail em texto).
2. **Os meus selos.** O cartão de fidelidade como objeto bonito: 10 selos animados, progresso, prémio desbloqueado com um momento de celebração contido.
3. **Histórico e próximas marcações.** Cancelar/reagendar dentro das regras da barbearia, com a política de faltas visível.
4. **Clube e cartões oferta.** Estado da assinatura, cortes restantes, saldo do cartão oferta.
5. **Loja.** Produtos com foto, encomenda e levantamento ao balcão (pagamento ao balcão).
6. **Falar com a barbearia.** WhatsApp/chamada num toque.
- **Multilinguagem** PT/EN/FR (escrita à mão, I.3.2) quando a funcionalidade `multilinguagem` estiver ativa.

**Princípios:** rapidez, confiança, a marca **da barbearia** em primeiro plano (a InstaBarber fica discreta no rodapé), animações curtas, funciona em 3G, acessível.

---

## 7 · Setor F · Página pública da barbearia (cada inquilino): 4 TEMPLATES

É a montra de cada cliente da InstaBarber e a nossa melhor publicidade. **Decisão do dono: oferecemos 4 modelos (templates) de página pública, desenhados de forma a que, qualquer que seja a identidade visual da barbearia (cor, logótipo, estilo), haja sempre pelo menos um que lhe fique bem.** Pensa nas variações: logótipo claro ou escuro, com ou sem fundo, transparente, muito fino ou muito pesado; cor de marca muito clara, muito escura, saturada ou apagada; barbearia clássica, moderna, premium ou jovem.

**Os 4 modelos** (todos com os mesmos blocos e funcionalidades; muda a linguagem visual; todos usam apenas Inter e SVG próprio, **sem fontes nem dependências novas**):
1. **Noir** · escuro premium. Cinzentos profundos, vidro, bordas de 1 px, brilho suave na cor da marca. É o irmão da landing e dos painéis. Ideal para logótipos claros, dourados, neon, marcas de luxo.
2. **Atelier** · claro editorial. Fundo `#FAFAF9`, muito espaço, tipografia grande e fina, secções limpas, a cor da marca usada com precisão cirúrgica. Ideal para logótipos escuros ou pretos, marcas minimalistas.
3. **Clássico** · tradição de barbearia. Papel creme e tinta escura, filetes duplos, cantos mais retos, motivo discreto de poste de barbeiro (SVG próprio), selos e cartuchos como num cartaz antigo. Ideal para barbearias vintage, logótipos com brasão ou ilustração.
4. **Vivo** · a cor da marca como protagonista. Grandes blocos de cor sólida, texto sobre a cor com contraste calculado, formas arredondadas generosas, energia. Ideal para marcas de cor forte (vermelho, azul, verde, roxo, laranja) e públicos jovens.

**Garantias obrigatórias (testadas):**
- **Placa de logótipo automática:** se o logótipo não tiver contraste suficiente com o fundo do modelo, aparece sobre uma placa neutra (clara ou escura) com cantos redondos, nunca ilegível, nunca esticado nem cortado; admite logótipo horizontal, vertical, quadrado e transparente.
- **Correção de contraste** da cor da marca (helpers puros de apresentação, com testes Vitest): `textoSobre(cor)`, `ajustarDestaque(cor, fundo)` e `recomendarModelo(cor, logótipo)`. Contraste **AA** em texto corrente e em botões, sempre.
- **Matriz de compatibilidade (teste Playwright + unitário):** 12 cores de marca (preto, branco, amarelo, laranja, vermelho, azul-marinho, azul-claro, verde, roxo, rosa, castanho, cinzento) × 4 modelos × 3 tipos de logótipo (claro, escuro, transparente). **Para cada cor e tipo de logótipo, pelo menos 2 dos 4 modelos têm de passar todas as verificações** (contraste, legibilidade do logótipo, sem sobreposição). Mostra-me a matriz com capturas.
- **O dono da barbearia escolhe o modelo** num seletor com pré-visualização viva **com a sua própria marca** e uma etiqueta «Recomendado para a tua marca». Troca de modelo sem perder nenhum conteúdo.
- **Persistência da escolha do modelo:** vê primeiro se o esquema atual (configuração do inquilino, Parte C/I) já tem onde guardar a escolha de modelo e a cor/logótipo. **Se existir, usa-o. Se não existir, PÁRA e pergunta-me:** é a única exceção possível à regra de não tocar no back-end, e a decisão é minha (será, no máximo, uma coluna de configuração, feita pela via correta: altera-se primeiro `docs/esquema/`, com testes, e só depois se copia para as migrações).

**Conteúdo da página (em todos os modelos):** capa com nome e horário aberto/fechado, **«Marcar agora»** em destaque, fila digital («2 pessoas à tua frente, cerca de 15 min»), serviços e preços, equipa, loja **com fotos dos produtos**, clube, selos, cartões oferta, localização, Livro de Reclamações eletrónico, idiomas. Carregamento instantâneo (estático/ISR onde possível), imagens otimizadas, SEO local (dados estruturados `BarberShop`), pré-visualização de partilha (Open Graph) com a marca da barbearia. A marca InstaBarber fica discreta no rodapé.

---

## 8 · Setor G · Administração Performa LAB

Quem usa: só nós. Ecrã operacional, **denso e rápido**: lista de barbearias (estado, plano, profissionais, última atividade), ficha da barbearia, **interruptores de funcionalidades** (a grelha D.3 gerada de `docs/esquema/04_dados_iniciais.sql`; verificação no servidor e na base de dados, nunca só na interface), adesões em curso, pedidos de contacto da landing, métricas de saúde (barbearias ativas, marcações, receita registada), registo de auditoria. Mesma identidade, mais compacto, com tabelas ordenáveis e filtros, e **página de catálogo de design** (setor A, 3.4).

---

## 9 · Setor H · Adesão, e-mails, PDFs e ecrãs transversais

- **Adesão (onboarding) da barbearia:** passos com barra de progresso («Passo 1 de 5»), campos grandes, validação inline, carregamento de logótipo e fotos por URL de carregamento criado no servidor; ecrã final com «o que fazer agora». Sensação de fintech de luxo, não de formulário.
- **Entrada e recuperação de acesso:** definir palavra-passe por ligação segura ou código (B9); nunca palavra-passe em PDF, e-mail ou tabela.
- **E-mails transacionais (Resend):** mantêm o timbrado já aprovado (D-102 a D-104); alinha a paleta com o sistema.
- **PDFs (jsPDF):** relatório mensal, cartão oferta, mapa de custos: tipografia, grelha e cores do sistema, rodapé obrigatório «Não é documento fiscal», nunca «recibo»/«fatura».
- **Estados globais:** 404, 500, sem permissão, sem ligação, manutenção, sessão expirada, funcionalidade desligada, em upgrade. Cada um com ilustração **geométrica própria** (SVG simples, sem imagens de stock) e uma saída clara.
- **Notificações e toasts:** curtos, com «desfazer» quando fizer sentido.

---

## 10 · Setor I · O que nos põe à frente do mercado mundial

Aplica estes «momentos de assinatura», com bom gosto e sem excesso:

1. **O dinheiro em jogo, sempre à vista.** Em cada painel há um número que importa (em risco, previsto, objetivo) e ele é o elemento mais forte do ecrã.
2. **Um toque para agir.** Do insight à ação sem ecrãs intermédios: ver cliente em risco → balão de mensagem → `wa.me`.
3. **Vaga livre = oportunidade.** Cada vaga vazia pode ser preenchida num gesto (lista de espera, cliente em risco com interesse, mensagem).
4. **Agenda que se sente viva:** contagem decrescente «começa em 12 min», cartão em curso com brilho suave, conclusão com micro-celebração.
5. **Radar de clientes perdidos** (nenhum concorrente tem): o ecrã que as pessoas vão mostrar umas às outras.
6. **Marca do inquilino respeitada** em todo o painel dele e na página pública, sem nunca perder legibilidade.
7. **Velocidade percebida:** esqueletos fiéis, prefetch das rotas prováveis, nada de ecrã em branco. (Atualizações otimistas só se o comportamento atual já as tiver; não mudes a lógica de dados.)
8. **Detalhe artesanal:** sons nenhuns; hápticos só via padrão web quando suportado; transições partilhadas entre lista e detalhe; números que contam; barras que crescem; estados vazios com personalidade (e português falado).
9. **Português que soa a Portugal**, claro e curto («Sem marcações hoje. Bora encher a agenda?»), nunca texto de máquina.

---

## 11 · Qualidade, verificação e processo (aplica a cada lote)

**Antes de qualquer entrega:** `npm run typecheck`, `lint`, `test` e `build` sem erros; testes SQL de `docs/esquema/testes` a passar; **testes de isolamento entre barbearias a passar (se falharem, pára tudo)**.

**Verificação visual obrigatória** (Playwright, sem dependências novas além das da stack): capturas em **390, 768 e 1440 px**, nos temas **Ouro e Neon** (e claro, se aprovado), com uma cor de inquilino clara, uma escura e uma de baixo contraste para provar a correção automática. Confirma: **sem deslize horizontal**, alvos ≥ 44 px, foco visível por teclado em tudo, contraste AA, `prefers-reduced-motion` respeitado, estados vazio/erro/carregamento/desligado/upgrade presentes.

**Desempenho:** LCP < 2,5 s no telemóvel em 4G na landing e na página pública; INP < 200 ms nas ações da agenda; sem salto de layout; imagens com tamanhos explícitos e `loading="lazy"`; JS por rota, nada de bibliotecas pesadas para um efeito.

**Mapa e registo:** corre `scripts/gerar-mapa.sh` e atualiza `docs/mapa-do-sistema.md` com cada rota/ecrã novo ou alterado. A fase não fecha com rota em `app/` fora do mapa. Atualiza `PROGRESSO.md` no fim de cada lote. Regista no `DECISOES.md`: **D-112** (extensão do desenho D-109 a todo o sistema e política de cor do inquilino), e uma decisão por cada escolha técnica relevante. Atualiza a Parte I (identidade) para que deixe de contradizer o `DECISOES.md`.

**Fluxo de trabalho:** um branch por lote, commits como «Claude», push, aguardar o Preview verde da Vercel, **enviar-me capturas (PC e telemóvel) e esperar o meu «sim» antes do merge**. Nunca avanço de fase sem a minha confirmação. Se faltar uma chave, **pára e pede**.

---

## 12 · Decisões do dono (RESPONDIDAS: não perguntes outra vez)

1. **Modo claro: sim.** Escuro, Claro e Sistema, todos desenhados a sério (ver 3.1).
2. **Tema/destaque por defeito: Ouro.**
3. **Nos painéis existem as 3 opções de destaque** (Ouro, Neon e Marca da barbearia), escolhidas pelo utilizador (ver 3.1). **Na página pública há 4 modelos de template** que garantem que qualquer identidade visual tem pelo menos um que lhe fica bem (ver setor F).
4. **Ordem de prioridade:** lote A (fundação) → lote B (financeiro) → Equipa → Gestão (agenda e radar) → Minha área → Página pública (4 modelos) → Administração → transversais.
5. **Fotos de produto: sim.** São marcas que qualquer pessoa pode revender; **cada barbearia vende a marca que quiser e usa fotos dos produtos**. O desenho da loja tem de prever foto por produto (moldura clara de cantos redondos, como na landing, D-111) em todos os painéis e na página pública, com placeholder elegante quando não houver foto, e usando o mecanismo de carregamento que já existir.
6. **Rótulos dos estados financeiros: como planeado** (Pago, Pendente, Em atraso, A acertar, Acertado), **desde que coincidam com os estados do esquema**; se o esquema usar outros nomes, usa os do esquema e diz-me.
7. **Ilustração dos estados vazios: geometria SVG minimalista, como na landing.** As alterações são de **experiência visual do utilizador**, ao nível das plataformas de referência que indiquei (Stripe, Linear, Vercel, Apple, Raycast, Arc, Cal.com, Fresha, Squire, Booksy, Vagaro). Lembra-te: **só front-end** (secção 0B).

---

## 13 · Luz verde e forma de trabalhar (LIBERADO)

**Estás liberado para começar assim que leres isto.** Faz um diagnóstico curto (1 a 2 páginas: o que existe em `app/` e `components/`, em que fase estamos, onde vai nascer cada módulo, e **confirma que ainda não há código financeiro**) e **começa já pelo lote A**, sem esperar por confirmação do plano. Depois segue **por ordem de prioridade**, como na secção 12.

**Onde PARAS e esperas por mim (só nestes casos):**
1. **Merge:** cada lote termina com branch, Preview da Vercel verde e capturas (PC e telemóvel) enviadas; **só fazes merge depois do meu «sim»**.
2. Algo exigir **tocar no back-end** (esquema, RLS, funções, repositórios, Server Actions, rotas, fórmulas): pára e pergunta (ver secção 0B e a persistência do modelo no setor F).
3. **Faltar uma chave** ou autorização de dependência: pára e pede; nunca inventes.
4. **Avanço de fase:** este redesenho **não adianta fases**. Os ecrãs dos painéis que ainda não existem entram quando a fase correspondente os construir, já no desenho novo. Se um lote exigir uma fase que ainda não foi aprovada, diz-me.

**Cadência:** no fim de cada lote manda-me um resumo curto em português de Portugal: o que ficou, capturas, o inventário de paridade funcional, o `git diff --stat` das áreas protegidas, e as «Sugestões para decidir». Mantém o `PROGRESSO.md` e o `DECISOES.md` (D-112 em diante) atualizados.

Objetivo final, para não te esqueceres: **quando um dono de barbearia em Lisboa, Londres ou São Paulo vir isto, tem de querer mudar já.**

---

## 14 · Ordem dos lotes e skills (decisão do dono, 24/10/2026)

**Ordem de execução.** Começa pelo **painel da Equipa (setor D, o barbeiro)** e segue pela ordem: D → C (Gestão, com o financeiro do setor B) → E (Minha área) → F (páginas públicas, os 4 modelos) → G (Administração) → H (transversais). Continua até tudo ficar ao nível do resto. O lote A (fundação) já está feito. Cada lote termina como diz a secção 13: ramo, Preview verde, capturas em 390, 768 e 1440 px nos temas Ouro e Neon, e só há merge depois do «sim» do dono.

**Skills disponíveis em `.claude/skills/` e ordem de prioridade:**

| Ordem | Skill | Papel |
| --- | --- | --- |
| 1 | `taste-skill` | Direção de arte e composição |
| 2 | `redesign-skill` | Auditar um ecrã existente e tirar o ar genérico |
| 3 | `ui-ux-pro-max` | **Verificador**: contraste, alvos de 44 px, estados vazios e de erro, movimento reduzido, formulários e navegação. Consulta com `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --domain ux` |
| 4 | `impeccable` (se instalada: `/impeccable critique` e `/impeccable polish` no fim de cada lote) | Crítica de UX e passagem final |
| 5 | `dataviz` (se disponível) | Só gráficos e KPIs do financeiro |
| — | `brandkit` | Só identidade (logótipos, ícones), nunca painéis |

**Regra de desempate:** a especificação deste prompt e o CLAUDE.md ganham sempre. Os hexadecimais da Parte I, a Inter, os destaques Ouro, Neon e Marca, o português de Portugal e o âmbito só de front-end não se mudam por sugestão de nenhuma skill. As skills de estética **propõem**; a `ui-ux-pro-max` **audita**. Quando duas discordam, decide esta regra e registas a escolha no `DECISOES.md`. A `ui-ux-pro-max` sugere paletas e fontes próprias: usa-a só como lista de verificação, nunca para trocar cores nem tipografia.

**Fim de cada lote:** corre a auditoria da `ui-ux-pro-max` e, se existir, `/impeccable critique` e `/impeccable polish`; corrige o que falhar e anexa à entrega a lista do que foi corrigido.

**Ficha de histórico de cortes (a decidir antes do lote D e do lote E).** O dono quer um histórico por cliente, uma entrada por serviço com até duas fotos e uma nota, visível ao barbeiro (antes de o cliente se sentar) e ao cliente (Minha área). A ficha técnica já existe (F.4.14), mas ligar cada ficha à marcação e ter duas fotos exige **alterar o esquema** (`docs/esquema/`, com testes). Isso é back-end e pára: apresenta a proposta (campo `marcacao_id`, segunda foto, consentimento do cliente e separação entre nota interna e nota visível) e espera o «sim» do dono antes de construir. Entretanto, desenha os ecrãs com a ficha existente.
