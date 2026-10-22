#!/usr/bin/env bash
# Imprime API_URL, ANON_KEY, SERVICE_ROLE_KEY e MAILPIT_URL do Supabase local como «export …»,
# venha o `supabase status` em formato env (CLI antiga) ou JSON (CLI recente).
# Uso: eval "$(scripts/supabase-env.sh)"
set -euo pipefail
npx supabase status -o json 2>/dev/null | python3 -c '
import json, sys, re
texto = sys.stdin.read()
inicio = texto.find("{")
d = json.loads(texto[inicio:]) if inicio >= 0 else {}
for k in ("API_URL", "ANON_KEY", "SERVICE_ROLE_KEY", "MAILPIT_URL"):
    if d.get(k): print(f"export {k}={json.dumps(d[k])}")
'
