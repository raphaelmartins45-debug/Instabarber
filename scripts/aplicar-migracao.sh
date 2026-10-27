#!/usr/bin/env bash
# Aplica uma migração ao ensaio ou à produção pela Management API e regista-a em
# supabase_migrations.schema_migrations (P-16). Na produção, corre a seguir a verificação do RLS.
# Antes da produção: testes no ensaio (scripts/testar-sql-ensaio.py) e cópia cifrada verificada.
# Uso: scripts/aplicar-migracao.sh ensaio|producao supabase/migrations/AAAAMMDDHHMMSS_nome.sql
set -euo pipefail
cd "$(dirname "$0")/.."
alvo="${1:?ensaio ou producao}"
ficheiro="${2:?ficheiro da migração}"
base="$(basename "$ficheiro" .sql)"
versao="${base%%_*}"
nome="${base#*_}"
[[ "$versao" =~ ^[0-9]{14}$ ]] || { echo "Nome inválido: $ficheiro"; exit 2; }
set -a; [ -f .env.local ] && . ./.env.local; set +a
python3 scripts/sql-remoto.py "$alvo" "$ficheiro"
echo "insert into supabase_migrations.schema_migrations (version, name) values ('$versao', '$nome')
  on conflict do nothing; select max(version) as ultima from supabase_migrations.schema_migrations;" |
  python3 scripts/sql-remoto.py "$alvo" -
if [ "$alvo" = producao ]; then
  echo "Verificação do RLS (sem_rls tem de ser 0):"
  python3 scripts/sql-remoto.py producao scripts/sql/verificar-rls.sql
fi
