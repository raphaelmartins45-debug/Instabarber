# Mudança para o regime de isenção de IVA (art. 53.º do CIVA)

> **Executado a 27/10/2026 (D-173)**: preços 19,99 € e 39,99 €, sem IVA a acrescer; regime `isento` na Vercel. Ficam por fazer: as peças das redes sociais (ponto 16), a revisão dos Termos e do contrato com o jurista e a confirmação do contabilista.

Documento de trabalho para o dono aprovar ponto a ponto. Criado a 26/10/2026; a executar a
27/10/2026, depois da aprovação. **Nada disto está feito ainda**: o sistema continua com
`PRESTADORA_REGIME_IVA=normal` (D-85).

## O que o dono definiu (26/10/2026)

A Prestadora (Michelle) está isenta de IVA até 15.000 € de faturação acumulada.

- **Faturas:** taxa de IVA de 0 %.
- **Menção obrigatória na fatura:** motivo de isenção «M10 — IVA - regime de isenção» (artigo 53.º do CIVA).
- **Cláusula contratual:** «Ao preço estipulado não acresce IVA, por se encontrar enquadrado no
  regime de isenção do Artigo 53.º do CIVA.»
- Mudar em todo o lado onde aparece «valor + IVA».
- Ao chegar a cerca de 1.000 € por mês, o dono abre uma Lda.; a Lda. passa ao regime normal (ver o fim).

## Decisão que falta antes de começar

**D1 · Qual é o preço da mensalidade durante a isenção?** A cláusula diz «ao preço estipulado não
acresce IVA». O preço estipulado pode ser:

- **A (recomendado, é a D-45 em vigor).** O preço continua 24,59 € (Basic) e 47,97 € (Pro), com os
  extras a 12,30 € e 6,15 €, agora sem IVA a acrescer. A barbearia paga o mesmo, e a Prestadora
  fica com o valor todo enquanto está isenta. Quando a Lda. passar ao regime normal, o preço final
  mantém-se e passa a incluir o IVA, por isso a barbearia nunca vê subida.
- **B.** O preço desce para 19,99 € e 39,00 € (extras a 10,00 € e 5,00 €) enquanto houver isenção.
  Na passagem à Lda. o preço sobe 23 %, o que pede aviso prévio a cada barbearia (cláusula 6.3) e
  aumenta o risco de cancelamentos.

> **Resposta do dono (26/10/2026): opção B**, «fica 19,99 e 39,99».
>
> - **Por confirmar:** o Pro passa de 39,00 € para **39,99 €**, ou foi engano e fica 39,00 €?
> - Valores diários que a landing destaca (preço ÷ 30 dias): Basic 0,82 € → **0,67 €**; Pro
>   1,60 € → **1,33 €** (39,99 €) ou **1,30 €** (39,00 €). Landing, linhas 704, 1018, 1031 e a nota
>   «Valor por dia calculado sobre 30 dias» (1044).
> - Anual (10 meses): Basic 245,88 € → **199,90 €**; Pro 479,70 € → **399,90 €** (ou 390,00 €).
> - Extras sem IVA: barbeiro adicional **10,00 €** e domínio próprio **5,00 €** (eram 12,30 € e 6,15 €).
> - Com a opção B, a fórmula da D.7 passa a cobrar o valor «sem IVA» como preço final enquanto
>   houver isenção. Quando a Lda. passar ao regime normal, o preço sobe 23 %, com aviso prévio a
>   cada barbearia (cláusula 6.3).
> - Muda o CLAUDE.md §6 (tabela de preços), a D.5/D.7, a tabela da landing e os Termos.

## Alterações (cada uma por aprovar)

O regime vive numa só variável (D-45): ao passar `PRESTADORA_REGIME_IVA=isento`, a proposta, o
contrato, a adesão e a fatura automática já mudam sozinhos. A lista inclui também os textos
escritos à mão.

| # | Onde | Hoje | Passa a | Aprovado |
| --- | --- | --- | --- | --- |
| 1 | Vercel e `.env.local`: `PRESTADORA_REGIME_IVA` | `normal` | `isento` | ☐ |
| 2 | Contrato, cláusula 6.1 (`docs/comercial/modelo-contrato.md`) | «{{valor_com_iva}} … preço final. Valor sem IVA: {{valor_sem_iva}}. {{iva_texto}}» | «{{valor}} por período de faturação, preço final. Ao preço estipulado não acresce IVA, por se encontrar enquadrado no regime de isenção do Artigo 53.º do CIVA.» (com o regime normal volta o texto atual). Nova versão do modelo, aprovada no Admin; os contratos já assinados não mudam | ☐ |
| 3 | Contrato, cláusula 6.4 | «incluindo o IVA à taxa legal aplicável, quando devido…» | Mantém-se: já prevê a mudança de enquadramento sem subir o preço. Confirmar com o jurista | ☐ |
| 4 | Texto da isenção no contrato e na proposta (`lib/i18n/pt-PT/comercial.ts`, `isento`) | «Isento de IVA, nos termos do artigo 53.º do CIVA.» | A frase da cláusula definida pelo dono | ☐ |
| 5 | Condições da proposta (`docs/comercial/modelo-condicoes-proposta.md`, ponto 2) | «Os preços incluem IVA à taxa legal em vigor, indicado separadamente.» | «Ao preço indicado não acresce IVA (regime de isenção do artigo 53.º do CIVA).» | ☐ |
| 6 | PDF da proposta (`lib/pdf/proposta.ts`) | Total sem IVA, total com IVA e linha do IVA | Um só total, com a frase da isenção (já é assim com `isento`; rever o aspeto) | ☐ |
| 7 | Formulário de adesão e resumo em PDF (`lib/i18n/pt-PT/adesao.ts`) | «com IVA» / «sem IVA» / «IVA a 23 % incluído» / isento: «IVA – Regime de Isenção» | Um só preço, com «Não acresce IVA (art. 53.º do CIVA)» | ☐ |
| 8 | Termos e Condições (`lib/i18n/pt-PT/legal/termos.ts`, preços) | «com e sem IVA… o preço final é o valor com IVA» e a lista «19,99 € sem IVA (24,59 € com IVA)…» | Preços finais (conforme D1) e a frase da isenção. Mudar os Termos pede aviso às barbearias (H.4) e rever com o jurista | ☐ |
| 9 | Landing (`landing/index.html`, 12 menções) | «IVA incluído» junto a cada preço; «Preços finais, com o IVA que for devido já incluído» | «Preço final» junto a cada preço e, no fim da tabela, «Não acresce IVA (regime de isenção do art. 53.º do CIVA)». Os exemplos da loja e da calculadora são da barbearia e não mudam | ☐ |
| 10 | Página pública e outros textos (`lib/i18n/publico/pt.ts`: «Preços finais, com IVA incluído quando aplicável») | Neutro | Mantém-se (é verdade nos dois regimes) | ☐ |
| 11 | Comprovativos (`lib/i18n/pt-PT/comprovativos.ts`): «Mensalidade (com IVA)» no Admin e no e-mail | «com IVA» | «Mensalidade» | ☐ |
| 12 | Admin, Pagamentos: «Valor (€, com IVA)» e «X sem IVA» no painel geral | «com/sem IVA» | Com isenção os dois valores são iguais: mostrar só um ou manter. Sugiro manter (é controlo interno) | ☐ |
| 13 | Aviso de adesão por e-mail («… (X com IVA)/mês») | «com IVA» | Só o preço final | ☐ |
| 14 | Fatura-recibo automática (D-170) | Com isenção usa taxa «Isento» e motivo M10 | Confirmar na conta do InvoiceXpress que a taxa a 0 % se chama «Isento» e que a menção sai como «M10 — IVA - regime de isenção» | ☐ |
| 15 | CLAUDE.md §6 | «Desde 22/10/2026 a Prestadora já não está isenta (D-85)» | Isenta (art. 53.º) até 15.000 €; nova decisão D-171 substitui a D-85 | ☐ |
| 16 | Redes sociais (`marketing/instagram/`: manual, guia de voz, `post-8`, `story-8`, reels) | «IVA incluído» em algumas peças | Rever as peças com preço; as imagens já publicadas ficam como estão ou trocam-se | ☐ |
| 17 | Finanças da Performa LAB | Indicadores «sem IVA» | Não muda: com isenção a receita sem IVA é o preço final; os cálculos já seguem a variável | ☐ |
| 18 | Textos da loja, da agenda, do financeiro e do relatório da barbearia | IVA da barbearia | Não muda: é o IVA da barbearia aos seus clientes, não o da Prestadora | — |

## Quando ultrapassar 15.000 € ou abrir a Lda.

- Ao passar os 15.000 € no ano, a isenção acaba. Pelas regras atuais, se passar mais de 25 %
  (18.750 €), acaba logo na fatura que o ultrapassa. **Confirmar com o contabilista** e vigiar o
  acumulado em Admin → Finanças.
- **Uma Lda. tem contabilidade organizada e fica no regime normal (IVA a 23 %).** A mudança é a
  variável `PRESTADORA_REGIME_IVA=normal` e os dados da Prestadora (`PRESTADORA_NOME`, `NIF`,
  `MORADA`, `QUALIDADE`) na Vercel. Os textos voltam sozinhos ao «IVA incluído».
- Os contratos já assinados são com a Michelle. Passar para a Lda. é uma cessão da posição
  contratual, que precisa do consentimento de cada barbearia (cláusula 19). Na altura preparo o
  aditamento e o e-mail.
- Com a opção A, o preço final não muda na passagem; com a B, sobe 23 % com aviso prévio.

## Ordem de execução (amanhã, depois das aprovações)

1. Decisão D1 e aprovação dos pontos.
2. Textos e modelos (pontos 2 a 13), com testes; nova versão do modelo de contrato aprovada no Admin.
3. Variável na Vercel (ponto 1) e publicação.
4. Verificar a proposta, o contrato e a adesão em PDF; a landing e os Termos no telemóvel.
5. Registar a D-171 e atualizar o CLAUDE.md e o PROGRESSO.
