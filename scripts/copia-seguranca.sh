#!/usr/bin/env bash
# Cópia de segurança externa (L.7, manual do operador P-13): papéis, esquema e dados, numa pasta
# com a data e a soma de verificação. Fazer todas as semanas e antes de qualquer alteração de
# esquema em produção. Guardar fora do Supabase, cifrado, com 30 dias de retenção.
# Os ficheiros do Storage (logótipos, fotografias) não vão no dump: copiar o bucket à parte.
# Uso: SUPABASE_DB_URL="postgresql://…" scripts/copia-seguranca.sh [pasta]
#      scripts/copia-seguranca.sh --local [pasta]      (Supabase local, para ensaios)
set -euo pipefail
cd "$(dirname "$0")/.."
if [ "${1:-}" = "--local" ]; then
  alvo=(--local)
  shift
else
  alvo=(--db-url "${SUPABASE_DB_URL:?Defina SUPABASE_DB_URL ou use --local}")
fi
pasta="${1:-copias}/$(date -u +%Y-%m-%dT%H%M%SZ)"
mkdir -p "$pasta"
npx supabase db dump "${alvo[@]}" --role-only -f "$pasta/papeis.sql" >/dev/null
npx supabase db dump "${alvo[@]}" -f "$pasta/esquema.sql" >/dev/null
# Tabelas internas do Storage e das funções: geridas pela plataforma, não são dados nossos.
internas=storage.buckets_analytics,storage.buckets_vectors,storage.iceberg_namespaces
internas+=,storage.iceberg_tables,storage.s3_multipart_uploads,storage.s3_multipart_uploads_parts
internas+=,storage.vector_indexes,supabase_functions.hooks
npx supabase db dump "${alvo[@]}" --data-only --use-copy -x "$internas" -f "$pasta/dados.sql" >/dev/null
(cd "$pasta" && sha256sum ./*.sql > SHA256SUMS)
echo "$pasta"
