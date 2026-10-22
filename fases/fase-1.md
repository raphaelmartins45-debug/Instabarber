# Fase 1 — Base de dados

| | |
| --- | --- |
| **Foco** | Base de dados |
| **Resultado verificável** | Esquema de `docs/esquema` aplicado no Supabase local e no projeto de ensaio; os 389 testes SQL a passar; tipos gerados. |
| **Dias estimados** | 2 |

## Ler nesta fase

Lê **apenas** isto. Não leias o documento mestre.

- `CLAUDE.md` (todo)
- `docs/parte-c-modelo-de-dados.md` (toda)
- `docs/esquema/README.md`

## Antes de começar

Apresenta o resumo do que vais construir, os ficheiros que vais criar e o que **não** vais fazer nesta fase. Espera pela minha confirmação antes de escrever código.

## O que construir

- [ ] Projeto Supabase em eu-central-1 (pede a palavra-passe da base de dados se faltar).
- [ ] Copiar `docs/esquema/01…04` para `supabase/migrations/` pela ordem, **sem os reescrever**.
- [ ] Aplicar no Supabase local e num projeto de ensaio. A produção só recebe as migrações na Fase 7.
- [ ] Correr `npm run test:sql` (sem o ficheiro `00_shim`, que só serve fora do Supabase).
- [ ] `npm run db:types` e os primeiros repositórios em `lib/repositorios` (só leitura, com tipos gerados).
- [ ] Se um teste falhar: **parar**, reportar e não contornar.

## Verificação

- [ ] Os 389 testes SQL a passar no Supabase local e no projeto de ensaio, com a saída mostrada.
- [ ] RLS ativo em todas as tabelas (consulta a `pg_tables` mostrada).
- [ ] `types/database.ts` gerado.

## No fim da fase

Corre `npm run typecheck`, `lint`, `test`, `test:sql` e `build` sem erros. Mostra o resultado verificável, atualiza o `PROGRESSO.md` e espera pela minha confirmação antes da fase seguinte.
