#!/usr/bin/env bash
# Restauro de uma cópia (L.7, P-13). Nunca sobre a produção: o alvo é um projeto novo ou o de
# ensaio. Com --completo (projeto vazio) repõe papéis, esquema e dados; sem ele, o alvo já tem as
# mesmas migrações e só os dados entram. No fim, confere o RLS e mostra as contagens.
# Uso: ALVO_DB_URL="postgresql://…" scripts/restaurar-copia.sh [--completo] copias/<data>
set -euo pipefail
cd "$(dirname "$0")/.."
completo=0
if [ "${1:-}" = "--completo" ]; then
  completo=1
  shift
fi
pasta="${1:?Indique a pasta da cópia}"
alvo="${ALVO_DB_URL:?Defina ALVO_DB_URL (nunca a produção)}"
if [ -n "${PRODUCAO_DB_HOST:-}" ] && [[ "$alvo" == *"$PRODUCAO_DB_HOST"* ]]; then
  echo "Recusado: o alvo é a produção." >&2
  exit 1
fi
(cd "$pasta" && sha256sum -c --quiet SHA256SUMS)
ficheiros=()
if [ "$completo" = 1 ]; then
  ficheiros+=(--file "$pasta/papeis.sql" --file "$pasta/esquema.sql")
else
  # As migrações já carregaram os dados de referência (funcionalidades, feriados, buckets): a cópia
  # traz os mesmos, por isso esvazia-se primeiro, na mesma transação.
  ficheiros+=(--file scripts/sql/esvaziar-para-restauro.sql)
fi
psql "$alvo" --single-transaction -v ON_ERROR_STOP=1 -q --output /dev/null "${ficheiros[@]}" \
  --command "set session_replication_role = replica" --file "$pasta/dados.sql"
psql "$alvo" -At -F ' | ' -f scripts/sql/verificar-rls.sql
psql "$alvo" -At -F ' | ' -f scripts/sql/contagens.sql
