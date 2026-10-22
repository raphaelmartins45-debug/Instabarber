# Fase 6 — Mensagens, módulos e relatório

| | |
| --- | --- |
| **Foco** | Mensagens, módulos e relatório |
| **Resultado verificável** | Mensagens abertas e registadas; e-mails de confirmação; filas; clube, loja e cartões oferta do lado público; relatório mensal; módulos de pagamentos e faturação desligados e invisíveis. |
| **Dias estimados** | 11 |

## Ler nesta fase

Lê **apenas** isto. Não leias o documento mestre.

- `CLAUDE.md` (todo)
- `docs/parte-f-regras-de-negocio.md` — F.4.1, F.4.3, F.4.4 (lado público), F.4.10, F.4.12, F.4.13, F.5
- `docs/parte-e-especificacao-das-quatro-camadas.md` — E.5
- `docs/parte-d-planos-funcionalidades-e-pacotes.md` — D.2
- `docs/parte-g-integracoes.md` (toda)

## Antes de começar

Apresenta o resumo do que vais construir, os ficheiros que vais criar e o que **não** vais fazer nesta fase. Espera pela minha confirmação antes de escrever código.

## O que construir

- [ ] `lib/regras/mensagens.ts` e os botões wa.me (individual, lote, lembretes, aniversário, avaliação, fila, loja), com o registo em `mensagens` e o filtro de consentimento.
- [ ] E-mail de confirmação de marcação (`confirmacao_email`).
- [ ] Fila de espera e fila presencial por QR (com estado em tempo real).
- [ ] Loja e encomendas na página pública; cartões oferta (venda, PDF, uso).
- [ ] Relatório mensal com os nove blocos, recomendações (`lib/regras/recomendacoes.ts`) e PDF no servidor.
- [ ] `lib/pagamentos` e `lib/faturacao` (G.4): interface, adaptador manual e simulado, modos de emissão; ecrã `/admin/modulos`; webhook a responder 404 desligado.
- [ ] Registar no `DECISOES.md` que os módulos são código desligado, não código morto.

## Verificação

- [ ] Mensagens abrem o WhatsApp certo e ficam registadas; cliente sem consentimento não aparece.
- [ ] Relatório coincide com o Início e o Financeiro.
- [ ] Teste ponta a ponta com os módulos desligados: nenhum ecrã da barbearia mostra pagamentos ou faturas.
- [ ] Ligar e desligar um módulo fica em auditoria.

## No fim da fase

Corre `npm run typecheck`, `lint`, `test`, `test:sql` e `build` sem erros. Mostra o resultado verificável, atualiza o `PROGRESSO.md` e espera pela minha confirmação antes da fase seguinte.
