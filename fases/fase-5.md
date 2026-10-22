# Fase 5 — Motor de agenda e cliente

| | |
| --- | --- |
| **Foco** | Motor de agenda e cliente |
| **Resultado verificável** | Um cliente entra pela página pública e marca sem conta; duas reservas simultâneas não ocupam o mesmo horário; política de faltas; área de cliente. |
| **Dias estimados** | 7 |

## Ler nesta fase

Lê **apenas** isto. Não leias o documento mestre.

- `CLAUDE.md` (todo)
- `docs/parte-f-regras-de-negocio.md` — F.4.5, F.7, F.8, F.9
- `docs/parte-e-especificacao-das-quatro-camadas.md` — E.4 e E.6
- `docs/parte-i-identidade-visual.md` — I.3.1 e I.3.2
- `docs/parte-h-conformidade-legal-e-protecao-de-dados.md` — H.2

## Antes de começar

Apresenta o resumo do que vais construir, os ficheiros que vais criar e o que **não** vais fazer nesta fase. Espera pela minha confirmação antes de escrever código.

## O que construir

- [ ] Página pública (E.6) a ler só das vistas `publico_*`, indexável, com dados estruturados.
- [ ] Marcação em passos com `vagas_livres()`, `reservar_vaga()` (contagem de 10 minutos) e `confirmar_reserva()`; códigos de erro traduzidos em frases.
- [ ] Palavra-passe opcional na primeira marcação para números novos (`pode_criar_acesso_direto()`, F.9).
- [ ] Área de cliente: selos, histórico, próxima marcação com cancelamento, clube, encomendas, código de convite, repetir o último serviço.
- [ ] Multilinguagem (`lib/i18n`) com a funcionalidade ligada.
- [ ] Livro de Reclamações e documentos legais no rodapé.

## Verificação

- [ ] Teste Playwright: marcação completa sem conta; duas reservas simultâneas, uma recusada.
- [ ] Os 54 testes SQL da agenda continuam a passar.
- [ ] Política de faltas verificada com um cliente de ensaio.
- [ ] Página pública validada num telemóvel real.

## No fim da fase

Corre `npm run typecheck`, `lint`, `test`, `test:sql` e `build` sem erros. Mostra o resultado verificável, atualiza o `PROGRESSO.md` e espera pela minha confirmação antes da fase seguinte.
