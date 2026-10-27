#!/usr/bin/env bash
# Constrói docs/esquema numa base nova do Supabase local e compara-a com a base das migrações:
# funções, políticas, colunas e restrições têm de ser iguais (regra 3 do CLAUDE.md).
# Uso (com o Supabase local a correr e acabado de repor): scripts/comparar-esquema.sh
set -euo pipefail
cd "$(dirname "$0")/../docs/esquema"
U=postgresql://postgres:postgres@127.0.0.1:54322
erro="$(mktemp)"
psql $U/postgres -qc "drop database if exists ib_docs" -c "create database ib_docs" >/dev/null
for f in testes/00_shim_supabase.sql 01_tabelas.sql 02_funcoes.sql 03_rls.sql 04_dados_iniciais.sql; do
  psql $U/ib_docs -v ON_ERROR_STOP=1 -q -f "$f" >/dev/null 2>"$erro" ||
    { echo "FALHOU $f"; head -3 "$erro"; exit 1; }
done
diferencas=0
for Q in \
 "select p.proname||':'||md5(pg_get_functiondef(p.oid)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by 1" \
 "select tablename||':'||policyname||':'||md5(coalesce(qual,'')||coalesce(with_check,'')) from pg_policies where schemaname in ('public','storage') order by 1" \
 "select table_name||':'||column_name||':'||data_type||':'||coalesce(column_default,'') from information_schema.columns where table_schema='public' order by 1" \
 "select conrelid::regclass||':'||conname||':'||md5(pg_get_constraintdef(oid)) from pg_constraint where connamespace='public'::regnamespace order by 1"; do
  diff <(psql $U/postgres -Atc "$Q") <(psql $U/ib_docs -Atc "$Q") || diferencas=1
done
psql $U/postgres -qc "drop database ib_docs" >/dev/null
rm -f "$erro"
[ "$diferencas" = 0 ] && echo "Esquema igual às migrações." || { echo "DIFERENÇAS acima."; exit 1; }
