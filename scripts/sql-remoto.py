#!/usr/bin/env python3
"""Corre um ficheiro SQL num projeto do Supabase pela Management API (sem a porta 5432, D-148).

Uso:
  scripts/sql-remoto.py ensaio   ficheiro.sql     (ou "-" para ler do stdin)
  scripts/sql-remoto.py producao ficheiro.sql

Lê do ambiente (o .env.local, nunca no Git): ensaio → SUPABASE_PROJECT_REF e SUPABASE_ACCESS_TOKEN;
produção → SUPABASE_PRODUCAO_REF e SUPABASE_PRODUCAO_ACCESS_TOKEN.

Na produção só se correm migrações (scripts/aplicar-migracao.sh) e scripts/sql/verificar-rls.sql.
Nunca os testes SQL, que criam dados de teste.
"""
import json
import os
import sys
import urllib.error
import urllib.request

ALVOS = {
    "ensaio": ("SUPABASE_PROJECT_REF", "SUPABASE_ACCESS_TOKEN"),
    "producao": ("SUPABASE_PRODUCAO_REF", "SUPABASE_PRODUCAO_ACCESS_TOKEN"),
}


def main() -> int:
    if len(sys.argv) != 3 or sys.argv[1] not in ALVOS:
        print(__doc__)
        return 2
    var_ref, var_token = ALVOS[sys.argv[1]]
    ref, token = os.environ.get(var_ref), os.environ.get(var_token)
    if not ref or not token:
        print(f"Faltam {var_ref} e {var_token} no ambiente (carregar o .env.local).")
        return 2
    sql = sys.stdin.read() if sys.argv[2] == "-" else open(sys.argv[2], encoding="utf-8").read()
    pedido = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ref}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(pedido, timeout=300) as r:
            print(r.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
