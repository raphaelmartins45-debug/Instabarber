## Parte I · Identidade visual

Esta Parte lê-se a partir da Fase 3: a qualidade da interface faz parte do
requisito desde o primeiro ecrã.

### I.1 · Paleta

| Elemento | Hexadecimal | Uso |
| --- | --- | --- |
| Preto principal | `#12100E` | Cabeçalhos, rodapés, faixas de destaque, botão primário |
| Dourado | `#F5A623` | Marcadores, realces, foco dos campos |
| Dourado escuro | `#C9821A` | Títulos de secção, ligações |
| Amarelo claro | `#FDF3E3` | Fundos de aviso e cartões em destaque |
| Fundo de página | `#F7F5F1` | Fundo geral da aplicação |
| Linha | `#E6E1D8` | Contornos e separadores |
| Verde | `#1F8A5F` | Valores positivos e confirmações |
| Vermelho | `#C0392B` | Alertas e valores negativos |
| Cinza de texto | `#8A847C` | Texto secundário |

A cor da capa de cada barbearia é escolhida pelo dono (E.6) e só se aplica à
página pública e ao cabeçalho dos PDF. O texto sobre ela é branco ou preto
conforme o contraste, sempre com o mínimo de 4,5 para 1.

### I.2 · Tipografia e componentes

- Família Inter, servida localmente com `next/font`, pesos 400 a 900. Sem Google Fonts.
- Corpo a 14 px; títulos de página a 20–22 px com peso 800; títulos de secção a 15 px; etiquetas a 10–11 px em maiúsculas, com espaçamento de letras.
- Cartões com raio de 16–18 px, contorno de 1 px e fundo branco.
- Botões primários a preto com texto branco; secundários com contorno e fundo branco; ação positiva a verde claro.
- Nas páginas do cliente final, os botões de ação têm título em negrito e uma linha secundária em cinzento claro.
- Nos formulários, etiqueta em maiúsculas pequenas por cima do campo; o foco aplica contorno dourado.
- Funcionalidades fora do plano marcadas «Upgrade» (D.3): botão desativado com o cadeado discreto e a chamada da D.2 num painel de amarelo claro.

### I.3 · Regras de interface por camada

- **Camada 1:** densidade alta, tabelas, filtros e separadores. Ferramenta de trabalho, otimizada para ler dados.
- **Camadas 2 e 3:** equilíbrio entre indicadores e listas, com faixas de ação no topo de cada página.
- **Camada 4:** interface de telemóvel, largura máxima de 460 px, botões grandes, uma ação por ecrã, botão de voltar sempre presente.

#### I.3.1 · Paridade mobile nas quatro camadas

Os quatro painéis — administração, barbearia, profissional e cliente — são
operacionais num telemóvel, com as mesmas funções. Não existe ação possível no
computador e impossível no telemóvel.

Abaixo de 768 px:

- Os separadores laterais passam a navegação inferior, com ícone e rótulo curto, no máximo cinco entradas visíveis; o resto num menu «Mais».
- As tabelas passam a cartões empilhados, um registo por bloco, com pares rótulo-valor. Nenhuma tabela mantém colunas.
- Formulários com um campo por linha, rótulos acima e botões em largura total.
- Qualquer ação destrutiva — apagar, cancelar, suspender, anonimizar — pede confirmação explícita, nunca fica a um toque.
- Valores e datas com o mesmo formato do computador. Nenhum número é abreviado.
- A ficha do inquilino no painel de administração, com dez separadores, passa a um fluxo de passos com indicador de posição.
- Alvos de toque com 44 px no mínimo. Nenhum botão encosta à margem do ecrã.

#### I.3.2 · Idiomas da página pública e da área de cliente

A aplicação é escrita em português de Portugal. Com a funcionalidade
`multilinguagem`, ligada pela Performa LAB, a página pública e a área de
cliente têm também inglês e francês. Mais nenhuma parte tem tradução: painéis,
administração, formulário de adesão, e-mails e relatórios são sempre em
português de Portugal.

**Língua de abertura**, com a funcionalidade ligada: a do dispositivo de quem
visita, olhando só aos dois primeiros caracteres do código. `pt` abre em
português; `fr` em francês; qualquer outro em inglês. Sem variantes: pt-BR abre
em português de Portugal, fr-CA em francês.

**Seletor manual** PT · EN · FR no rodapé da página e na área de cliente. Troca
a língua sem recarregar e sem deixar texto na língua anterior. Com a
funcionalidade desligada, não aparece.

**Textos da interface** (botões, menus, avisos, erros): nas três línguas,
escritos à mão, em `lib/i18n/pt.ts`, `en.ts` e `fr.ts`. Nada é traduzido
automaticamente: um tradutor automático devolveria «Skin cleaning» onde o
correto é «Facial treatment».

**Texto do dono** (nome e descrição dos serviços): o dono pode escrever as
versões em inglês e francês, sempre opcionais (F.3.2). O que não escrever
aparece em português. A história da barbearia aparece sempre como o dono a
escreveu.
