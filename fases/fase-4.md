# Fase 4 — Painel da barbearia

| | |
| --- | --- |
| **Foco** | Painel da barbearia |
| **Resultado verificável** | O dia a dia gerido no sistema: agenda ao balcão, clientes, radar, ficha técnica, ausências, equipa, financeiro, comissões e acertos, Gestão do sistema, O meu plano. |
| **Dias estimados** | 10 |

## Ler nesta fase

Lê **apenas** isto. Não leias o documento mestre.

- `CLAUDE.md` (todo)
- `docs/parte-e-especificacao-das-quatro-camadas.md` — E.2 e E.3
- `docs/parte-f-regras-de-negocio.md` — F.1, F.2, F.3, F.4.2, F.4.4, F.4.6, F.4.7, F.4.8, F.4.9, F.4.11, F.4.14
- `docs/parte-i-identidade-visual.md` — I.2 e I.3

## Antes de começar

Apresenta o resumo do que vais construir, os ficheiros que vais criar e o que **não** vais fazer nesta fase. Espera pela minha confirmação antes de escrever código.

## O que construir

- [ ] Início, agenda (marcar ao balcão, concluir com `concluir_marcacao()`, faltou, órfãs), equipa.
- [ ] Clientes: radar (`lib/regras/classificacao.ts`), ficha, ficha técnica, pedidos de acesso.
- [ ] Financeiro: objetivos, custos, despesas, comissões e acertos (`lib/regras/acertos.ts`, `lib/regras/financeiro.ts`).
- [ ] Gestão do sistema: todas as secções da E.2 que dependem só desta fase (estado, marca, horário, ausências, feriados, equipa por convite, serviços, fidelização, aniversário, faltas, ligações, clube, loja, períodos, cartões oferta).
- [ ] Painel do profissional (E.3) e O meu plano.
- [ ] Funcionalidades fora do plano: «Sai» ou «Upgrade» (D.3).

## Verificação

- [ ] Uma barbearia de ensaio faz um dia completo no sistema.
- [ ] Testes Vitest de classificação, objetivos, acertos e financeiro.
- [ ] Os números do Início coincidem com o Financeiro.
- [ ] Tudo verificado num telemóvel.

## No fim da fase

Corre `npm run typecheck`, `lint`, `test`, `test:sql` e `build` sem erros. Mostra o resultado verificável, atualiza o `PROGRESSO.md` e espera pela minha confirmação antes da fase seguinte.
