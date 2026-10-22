# Fase 7 — Publicação

| | |
| --- | --- |
| **Foco** | Publicação |
| **Resultado verificável** | Produção com domínio, HTTPS, subdomínios, cópias de segurança e documentos legais publicados. |
| **Dias estimados** | 3 |

## Ler nesta fase

Lê **apenas** isto. Não leias o documento mestre.

- `CLAUDE.md` (todo)
- `docs/parte-l-publicacao-dominios-e-custos.md` (toda)
- `docs/parte-h-conformidade-legal-e-protecao-de-dados.md` (toda)
- `docs/parte-m-operacao-e-suporte.md` — M.4

## Antes de começar

Apresenta o resumo do que vais construir, os ficheiros que vais criar e o que **não** vais fazer nesta fase. Espera pela minha confirmação antes de escrever código.

## O que construir

- [ ] Seguir a L.8 passo a passo, com os testes SQL no projeto de ensaio.
- [ ] Domínio com os nameservers da Vercel, wildcard e endereços de retorno do Supabase Auth.
- [ ] Documentos legais revistos e publicados.
- [ ] Cópia de segurança externa e um restauro de ensaio.

## Verificação

- [ ] Ciclo completo numa barbearia de ensaio em produção.
- [ ] Os 389 testes SQL a passar no projeto de ensaio com as migrações de produção; em produção, só a consulta de RLS ativo em todas as tabelas.
- [ ] Restauro testado.

## No fim da fase

Corre `npm run typecheck`, `lint`, `test`, `test:sql` e `build` sem erros. Mostra o resultado verificável, atualiza o `PROGRESSO.md` e espera pela minha confirmação antes da fase seguinte.
