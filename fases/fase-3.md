# Fase 3 — Administração e adesão

| | |
| --- | --- |
| **Foco** | Administração e adesão |
| **Resultado verificável** | Uma barbearia criada de ponta a ponta pela interface: formulário, pedido, aprovação, pacote, convite do dono, importação CSV. |
| **Dias estimados** | 6 |

## Ler nesta fase

Lê **apenas** isto. Não leias o documento mestre.

- `CLAUDE.md` (todo)
- `docs/parte-d-planos-funcionalidades-e-pacotes.md` (toda)
- `docs/parte-e-especificacao-das-quatro-camadas.md` — E.1
- `docs/parte-i-identidade-visual.md` (toda)
- `docs/parte-h-conformidade-legal-e-protecao-de-dados.md` — H.3 e H.4
- `docs/parte-l-publicacao-dominios-e-custos.md` — L.3 e L.5

## Antes de começar

Apresenta o resumo do que vais construir, os ficheiros que vais criar e o que **não** vais fazer nesta fase. Espera pela minha confirmação antes de escrever código.

## O que construir

- [ ] `lib/regras/mensalidade.ts` (D.7) com testes.
- [ ] Formulário de adesão em quatro passos, com seletor de profissionais, periodicidade, preços com e sem IVA, imagens por URL assinado, modelo de caixa e preferência de pagamento.
- [ ] Resumo da contratação em PDF («Não é documento fiscal»).
- [ ] Painel de administração: painel geral, barbearias (dez separadores), pedidos, funcionalidades, pagamentos.
- [ ] Aprovação: inquilino, `aplicar_pacote()`, conta do dono, e-mail de boas-vindas.
- [ ] Importação CSV de clientes e serviços, sem consentimento.
- [ ] Vista de apoio só de leitura, com justificação, 30 minutos e auditoria.
- [ ] Domínio próprio na ficha (separador Identidade), com o extra na mensalidade (D.7).
- [ ] Exportação dos dados de uma barbearia (ou de um cliente) em CSV e «Eliminar definitivamente» com `eliminar_inquilino()` (E.1).

## Verificação

- [ ] Uma barbearia criada pela interface em menos de cinco minutos, sem tocar na base de dados.
- [ ] O dono recebe o e-mail e entra.
- [ ] A mensalidade do formulário bate com os exemplos da D.5.
- [ ] Testes Vitest de `mensalidade.ts`.

## No fim da fase

Corre `npm run typecheck`, `lint`, `test`, `test:sql` e `build` sem erros. Mostra o resultado verificável, atualiza o `PROGRESSO.md` e espera pela minha confirmação antes da fase seguinte.
