#!/usr/bin/env bash
# Ensaios de ponta a ponta (Playwright) contra o Supabase local.
# Repõe a base local (migrações de supabase/migrations), constrói com as chaves locais e corre
# os testes; o e2e/semear.ts cria as duas barbearias e os cinco papéis.
# Uso: npm run test:e2e:local   (precisa de `supabase start`)
set -euo pipefail
cd "$(dirname "$0")/.."
npx supabase db reset >/dev/null
eval "$(scripts/supabase-env.sh)"
export NEXT_PUBLIC_SUPABASE_URL="$API_URL" NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY"
export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" MAILPIT_URL ROOT_DOMAIN=localhost
# Nenhum e-mail real nos ensaios: a rota de contacto tem de falhar com a chave errada (e2e/landing).
export RESEND_API_KEY=re_chave_invalida_dos_ensaios
# Identificação fictícia da Prestadora para os documentos legais nos ensaios.
export PRESTADORA_NOME="Prestadora de Ensaio" PRESTADORA_NIF=999999990 PRESTADORA_MORADA="Rua do Ensaio, Viseu"
export PRESTADORA_QUALIDADE="empresário em nome individual" PRESTADORA_ASSINANTE="Assinante de Ensaio"
npm run build >/dev/null
npx playwright test "$@"
