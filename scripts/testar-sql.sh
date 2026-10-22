#!/usr/bin/env bash
# Corre os testes SQL de docs/esquema/testes contra a base de dados indicada.
# Uso: SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npm run test:sql
# Os testes correm dentro de transações desfeitas, mas o ficheiro 05 cria dados de teste:
# usar só no Supabase local ou numa base de ensaio, nunca na produção com dados reais.
set -euo pipefail
cd "$(dirname "$0")/../docs/esquema"
: "${SUPABASE_DB_URL:?Defina SUPABASE_DB_URL (base local ou de ensaio)}"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -f testes/05_dados_teste.sql >/dev/null
falhas=0
for f in testes/10_isolamento.sql testes/20_agenda.sql testes/30_regras.sql testes/40_comercial.sql testes/50_financas.sql testes/60_expansao.sql testes/70_admin.sql testes/80_painel.sql testes/90_cliente.sql testes/95_mensagens_filas.sql; do
  if ! psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -t -f "$f" 2>&1 | grep -E 'NOTICE|ERROR|==' | sed -E 's/^psql:[^ ]+ //; s/NOTICE:  //'; then
    falhas=1
  fi
done
psql "$SUPABASE_DB_URL" -q -c "drop schema teste cascade;" >/dev/null || true
exit $falhas
