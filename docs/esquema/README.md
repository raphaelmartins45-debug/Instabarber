# Esquema da base de dados — versão 10.3

Esta pasta é a **fonte única** do esquema. A Parte C explica-o; estes ficheiros
são o que corre. Na Fase 1, o Claude Code copia-os para `supabase/migrations/`
pela mesma ordem, sem os reescrever.

| Ficheiro | O que tem |
| --- | --- |
| `01_tabelas.sql` | Todas as tabelas, chaves compostas por inquilino e restrições |
| `02_funcoes.sql` | Funções de papel, gatilhos de proteção, motor de agenda, conclusão de serviços, entradas públicas, vistas e permissões de execução |
| `03_rls.sql` | A matriz de Row Level Security (cinco papéis) e as políticas do Storage |
| `04_dados_iniciais.sql` | A grelha de funcionalidades e os pacotes (fonte da tabela D.3), feriados nacionais 2026–2028, módulos desligados e buckets |
| `testes/00_shim_supabase.sql` | Só para testar num Postgres sem Supabase. **Nunca** num projeto Supabase |
| `testes/05_dados_teste.sql` | Duas barbearias, os cinco papéis e dados de teste |
| `testes/10_isolamento.sql` | 81 testes de isolamento entre barbearias e papéis |
| `testes/20_agenda.sql` | 54 testes do motor de agenda, incluindo os dois dias de mudança de hora |
| `testes/30_regras.sql` | 66 testes de comissões, clube, selos, faltas, loja, acertos, acesso e anonimização |
| `testes/50_financas.sql` | 76 testes das Finanças da Performa LAB (Parte O): custos, contas a pagar, metas, lembretes de vencimento, vista dos vencimentos e isolamento |
| `testes/60_expansao.sql` | 7 testes das colunas dormentes de país, fuso, moeda e idioma (Parte P) |
| `testes/40_comercial.sql` | 112 testes do módulo Comercial (Parte N): NIF, numeração, leads do site, funil, propostas, contratos, convites, isolamento e retenção |

## Como correr os testes

Num Postgres 15 ou 16 limpo:

```bash
createdb ib_teste
for f in testes/00_shim_supabase.sql 01_tabelas.sql 02_funcoes.sql 03_rls.sql \
         04_dados_iniciais.sql testes/05_dados_teste.sql \
         testes/10_isolamento.sql testes/20_agenda.sql testes/30_regras.sql testes/40_comercial.sql testes/50_financas.sql testes/60_expansao.sql; do
  psql -d ib_teste -v ON_ERROR_STOP=1 -q -f "$f" || break
done
```

Cada teste escreve `ok   …` e a primeira falha para tudo com `FALHOU: …`.

Com o Supabase local (`supabase start`), os ficheiros 01 a 04 já são as
migrações. Os testes correm com `psql` na base local sem o ficheiro `00` (o
Supabase já tem `auth`, `storage` e os papéis).

Validado a 21 de outubro de 2026 em PostgreSQL 16.15: os quatro ficheiros
aplicam-se de uma vez e os 389 testes passam.

## Regras para alterar o esquema

1. Uma alteração ao esquema muda primeiro estes ficheiros e os testes; só depois o código.
2. Todo o teste de isolamento que falhe **para tudo** (CLAUDE.md §3).
3. Identificadores só em ASCII, minúsculas e underscore.
4. Funções `security definer` sempre com `set search_path = ''` e nomes qualificados,
   e acrescentadas à secção 9 do `02_funcoes.sql` com o `grant` mínimo.
5. Uma tabela nova entra no `03_rls.sql` com as políticas dos cinco papéis,
   mesmo que seja para dizer que um papel não tem acesso.
