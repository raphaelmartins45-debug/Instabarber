# PROMPT · Páginas públicas das barbearias: auditoria, 9 aspetos e personalização

Este prompt substitui e alarga o **setor F** do `prompt-redesenho-v4.md` (secção 7). Lê primeiro o `CLAUDE.md` e a secção 14 do v4 (ordem das skills e regra de desempate). Tudo em português de Portugal (Acordo de 1990), sem brasileirismos e sem a palavra «piloto».

---

## 0 · Objetivo

A página pública (`/b/[slug]` e as rotas `marcar`, `fila`, `loja`, `minha-area`, `entrar`) é a montra de cada barbearia e a nossa melhor publicidade. Tem de deixar o **dono (inquilino)** de boca aberta quando escolhe o aspeto, e o **cliente final** com vontade de marcar. Quando um dono de barbearia vir a página dele, tem de pensar «isto parece de uma marca grande».

Hoje a capa é um bloco de cor sólida (`d.cor`) com o texto calculado por `corDoTexto`. Isto funciona, mas é um só aspeto. Queremos **um catálogo de modelos**, cada um com personalidade própria, e **formas de o inquilino o ajustar** ao negócio dele.

## 1 · Âmbito e não-regressão (regra mais importante)

- **Só front-end:** apresentação, composição, tokens, movimento, componentes e testes visuais. Pastas: `components/publico/`, `app/(publico)/b/[slug]/`, `lib/regras/contraste.ts` (helpers puros de apresentação) e o que for novo em `lib/publico/modelos/`.
- **Não se toca** em esquema, migrações, RLS, repositórios, Server Actions, rotas de API, regras de cálculo, `lib/i18n` além de textos novos, nem em fórmulas. Mostra o `git diff --stat` das áreas protegidas no fim de cada lote.
- **Nada do que o cliente faz hoje pode desaparecer** (marcar, fila, loja, clube, selos, cartões oferta, avaliação, Livro de Reclamações, PT/EN/FR, entrar, minha área). Faz o inventário de paridade antes e depois.
- **A escolha do modelo e as opções de personalização têm de ficar guardadas.** Vê se a configuração do inquilino já tem onde (cor e logótipo existem: `logo_url`/`logo_path` e a cor da capa). **Se não existir lugar para o modelo e para as opções, PÁRA e pergunta-me**, com a proposta exata (colunas, valores permitidos, testes SQL). É a única exceção permitida ao «só front-end». Entretanto desenha tudo com a opção por defeito.
- Sem dependências novas e sem fontes novas sem a minha autorização escrita. Só Inter, SVG próprio e CSS. Ver a pergunta da secção 4.4.
- Dinheiro, datas, fuso e textos vêm de `lib/formatacao` e `lib/i18n` (nada escrito à mão).

## 2 · FASE 1 · Auditoria (faz isto primeiro e pára)

Sem escrever código de produto. Resultado: um relatório em `docs/redesenho/auditoria-paginas-publicas.md` e **o meu «sim»** antes de passar à Fase 2.

**Skills, por esta ordem** (a minha especificação e o CLAUDE.md ganham sempre):
1. `redesign-skill` para auditar o que existe e identificar o ar genérico.
2. `taste-skill` para a direção de arte de cada modelo.
3. `ui-ux-pro-max` como **verificador** (acessibilidade, toque, estados, formulários, navegação, movimento): `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --domain ux`. Usa-a só como lista de verificação, nunca para trocar a Inter nem as regras desta secção.
4. `impeccable` (se instalada): `/impeccable audit` e `/impeccable critique` sobre as páginas.
5. `dataviz` não se aplica aqui.

**O que auditar** (em 390, 768 e 1440 px, claro e escuro quando aplicável, e com PT, EN e FR):
- A página inicial e cada rota pública, com dados de demonstração realistas (3 barbeiros, 8 serviços, loja com fotos, clube, selos, fila ativa).
- As **cinco dimensões** do `impeccable audit` (acessibilidade, desempenho, temas, responsivo, integridade) com nota 0 a 4 e prioridades **P0 a P3**.
- **A matriz de marca:** as 12 cores (preto, branco, amarelo, laranja, vermelho, azul-marinho, azul-claro, verde, roxo, rosa, castanho, cinzento) × os 3 tipos de logótipo (claro, escuro, transparente) × o aspeto atual. Mostra onde falha o contraste AA, onde o logótipo fica ilegível ou cortado e onde a página fica «sem graça».
- **Primeira impressão em 3 segundos:** o que diz a capa? Dá vontade de marcar? A fila e o «Marcar agora» são vistos de imediato?
- Lista o que já está bem e deve ser mantido.

**Entrega da Fase 1:** o relatório, com uma proposta de 1 página por modelo (secção 4) confirmada ou ajustada pela auditoria, e **uma maquete estática de cada modelo** (HTML ou capturas), na mesma barbearia de demonstração, para eu escolher. **Pára e espera o meu «sim».**

## 3 · FASE 2 · Arquitetura dos modelos

- Cada modelo é um **conjunto de tokens e de composição**, não uma página nova. Os blocos e a lógica são os mesmos; muda a linguagem visual. Tudo em `lib/publico/modelos/<nome>.ts` (tokens) e `components/publico/modelos/` (variações de composição), um componente por ficheiro e abaixo de 200 linhas.
- A **cor da marca** do inquilino entra como entrada e o sistema **deriva** o resto (fundos, superfícies, bordas, texto, realces) com helpers puros testados (Vitest): `textoSobre(cor)`, `ajustarDestaque(cor, fundo)`, `derivarPaleta(cor, modelo)`, `recomendarModelo(cor, logotipo)`. Contraste **AA** (4.5:1 em texto corrente e botões; 3:1 em texto grande) em todas as combinações, **corrigido automaticamente** quando a cor escolhida não chega.
- **Placa de logótipo automática**: se o logótipo não contrastar com o fundo do modelo, aparece sobre uma placa neutra com cantos adequados ao modelo, sem esticar nem cortar. Admite logótipo horizontal, vertical, quadrado e transparente.
- Movimento com propósito (150 a 250 ms nas interações, 400 a 700 ms nas entradas, curva `cubic-bezier(.22,1,.36,1)`), `prefers-reduced-motion` respeitado sem perder estado nem hierarquia.
- **Desempenho:** capa sem imagens pesadas por defeito, fotografias do inquilino em formatos leves com reserva de espaço (sem saltos de layout), `loading="lazy"` abaixo da primeira dobra.
- Os 3 idiomas (PT, EN, FR) têm de caber em todos os modelos sem partir a composição.

## 4 · O catálogo (mínimo 6 modelos; este prompt pede 7 modelos e 9 aspetos)

Todos têm os **mesmos blocos**: capa com nome, estado aberto/fechado e «Marcar agora» em destaque; fila digital («2 pessoas à tua frente, cerca de 15 min»); serviços e preços; equipa; loja com fotos; clube e selos; cartões oferta; localização e horário; avaliação; Livro de Reclamações; idiomas. Para cada modelo entrega, na maquete: capa, lista de serviços, equipa, loja, marcação em 3 passos e «Minha área».

### 4.1 · Noir (escuro premium)
Fundo `#09090B`, superfícies `#121214`/`#18181B`, bordas `rgba(255,255,255,.08)`, vidro só em camadas flutuantes. A cor da marca é o único realce, com brilho suave. Capa com aurora discreta na cor da marca e números tabulares. Ideal para logótipos claros, dourados e neon, marcas de luxo. Irmão da landing e dos painéis. **A verificar:** que não fique parecido com a landing da InstaBarber.

### 4.2 · Atelier (claro editorial)
Fundo `#FAFAF9`, muito espaço, títulos grandes e leves (peso 300 a 400, tracking apertado), filetes finos, a cor da marca usada com precisão cirúrgica (um botão, um traço, um número). Fotografia da equipa em molduras limpas. Ideal para logótipos escuros ou pretos e marcas minimalistas.

### 4.3 · Vivo (a cor da marca como protagonista) — **3 variações de cor**
Blocos grandes de cor, texto com contraste calculado, formas arredondadas generosas, energia. Entrega **três variações** do mesmo modelo, escolhíveis pelo inquilino:
- **Vivo Sólido:** a cor da marca a toda a largura na capa e nos botões; o resto em branco quente.
- **Vivo Duo:** a cor da marca com uma segunda cor **derivada** (análoga ou complementar, calculada) em faixas e etiquetas.
- **Vivo Noite:** a cor da marca sobre fundo escuro profundo, com brilho; a versão «festa» do mesmo modelo.
Ideal para vermelho, azul, verde, roxo, laranja e públicos jovens.

### 4.4 · Clássico (restilizado: tradição e retro a sério)
O atual não convence. Refaz o modelo como um **cartaz de barbearia antiga**: papel creme com grão subtil em SVG, tinta quase preta, **filete duplo** e cantos cortados, **poste de barbeiro** em SVG como motivo (listras ajustadas à cor da marca, sem vermelho e azul fixos), selos e cartuchos como num letreiro, números de preço em estilo de «lista de preços» com pontilhado, banners em fita, ornamentos nos cantos e separadores de secção. Botões como etiquetas de cartão. Ideal para barbearias vintage, brasões e logótipos ilustrados.
**Pergunta ao dono (não decidas sozinho):** a tipografia retro ganharia muito com **uma fonte de exibição própria** (um slab ou uma condensada de cartaz, autoalojada, licença livre). Isto foge à regra «só Inter». Propõe 2 opções com o ganho visual e **pára** a perguntar; até lá usa Inter em maiúsculas com tracking aberto e peso 800, que já dá um bom resultado.

### 4.5 · Novos modelos (propõe e valida na auditoria)
- **Street** (urbano): grelha forte e visível, tipografia enorme em maiúsculas, contraste alto, etiquetas e «autocolantes» a ligeiro ângulo, faixas de aviso, cor da marca em blocos chapados. Ideal para barbearias de rua, fades e públicos jovens.
- **Maison** (luxo discreto): preto profundo ou marfim, linhas finas, muito ar, números e palavras de peso leve, realce metálico derivado da cor da marca (ouro, prata ou bronze), fotografia grande. Ideal para marcas premium e barbearias de hotel.
- **Oficina** (artesanal): tons de couro, madeira e ferro derivados da cor da marca, texturas subtis em SVG (costura, rebites, veios), cartões como etiquetas de oficina, fundo quente. Ideal para barbearias de ofício e produtos feitos à mão.
Se a auditoria justificar, troca um destes por **Foto** (a capa é uma fotografia grande do espaço ou da equipa, com a cor da marca em sobreposição), mas só se a carga de imagem se mantiver leve.

**Resumo:** Noir, Atelier, Vivo (×3), Clássico, Street, Maison e Oficina = **7 modelos, 9 aspetos**.

## 5 · Personalização pelo inquilino (dentro de cada modelo)

Propõe um conjunto pequeno e seguro de **escolhas**, sempre dentro do que garante bom desenho e contraste AA:
- **Cor da marca** (seletor com as 12 predefinidas e cor livre, com correção automática de contraste e aviso claro).
- **Cantos:** retos, suaves ou redondos (cada modelo restringe ao que lhe fica bem).
- **Fundo da capa:** cor, gradiente discreto ou fotografia do inquilino, com sobreposição calculada para o texto ser legível.
- **Densidade:** arejada ou compacta nos serviços e na equipa.
- **Estilo do botão «Marcar agora»:** cheio, contorno ou etiqueta (nos modelos que o permitam).
- **Logótipo:** placa clara, escura ou automática.
O inquilino vê tudo numa **pré-visualização viva com a sua própria marca**, com a etiqueta «Recomendado para a tua marca» e a troca de modelo **sem perder nenhum conteúdo**. Mostra primeiro o **melhor modelo recomendado** e depois os restantes. Dá a possibilidade de **ver o aspeto em telemóvel e em computador**. Persistência: ver a secção 1.

## 6 · Garantias obrigatórias (testadas)

- **Matriz de compatibilidade** (teste Playwright e unitário): 12 cores × 7 modelos (9 aspetos) × 3 tipos de logótipo. Em cada célula: contraste AA, logótipo legível e sem corte, sem rolagem horizontal em 390 px, botão «Marcar agora» visível sem rolar. Para cada cor e tipo de logótipo, **pelo menos um aspeto fica excelente** e o sistema recomenda-o.
- **Catálogo interno** em `/admin/design/modelos` (só super_admin com 2FA) com a matriz visual, para eu ver tudo de uma vez nos temas e em 390, 768 e 1440 px.
- `typecheck`, `lint`, `test`, `build` sem erros e os testes Playwright a passar, no computador e no telemóvel. Sem alterações em esquema, migrações, repositórios, regras ou API (mostra o `git diff --stat`).
- Acessibilidade: contraste AA, alvos de toque de 44 px, foco visível, ordem de tabulação lógica, nomes acessíveis, `prefers-reduced-motion`, e leitura correta em PT, EN e FR.

## 7 · Lotes e paragens

- **Lote F1:** Fase 1 (auditoria + maquetes). **Pára e espera o meu «sim».**
- **Lote F2:** arquitetura (helpers, tokens, placa de logótipo, seletor com pré-visualização) e os modelos **Noir, Atelier e Vivo (×3)**.
- **Lote F3:** **Clássico** restilizado (depois da minha resposta sobre a fonte) e **Street, Maison e Oficina**.
- **Lote F4:** personalização, recomendação automática, catálogo `/admin/design/modelos`, matriz de testes e `impeccable polish`.
Em cada lote: ramo próprio, Preview da Vercel verde, capturas em 390, 768 e 1440 px, inventário de paridade, o `git diff --stat` das áreas protegidas e uma lista curta do que a `ui-ux-pro-max` e o `impeccable` acharam e foi corrigido. **Só há merge depois do meu «sim».**

**Pára e pergunta sempre que:** for preciso tocar no back-end (inclui a persistência do modelo), faltar uma chave, uma dependência ou uma fonte nova, ou uma decisão de produto não estiver especificada.

Objetivo final: quando um barbeiro vir a página dele num destes modelos, tem de querer **mostrá-la** a toda a gente.
