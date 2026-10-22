#!/usr/bin/env python3
"""Testes SQL no projeto de ensaio pela Management API do Supabase (L.8, passo 2; D-111).

Sem ligação à porta 5432: cada ficheiro vai num pedido, sem as linhas do psql (\\set…). Os dados
de teste do ficheiro 05 já estão no ensaio; aqui só se criam as funções de apoio (esquema
`teste`) e no fim apagam-se. A API não devolve os NOTICE: conta-se o número de verificações de
cada ficheiro e uma falha devolve «FALHOU: …» e para.

Uso: SUPABASE_PROJECT_REF=… SUPABASE_ACCESS_TOKEN=… python3 scripts/testar-sql-ensaio.py
Nunca na produção: os testes precisam dos dados de teste.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

PASTA = Path(__file__).resolve().parent.parent / "docs" / "esquema" / "testes"
FICHEIROS = ["10_isolamento", "20_agenda", "30_regras", "40_comercial", "50_financas",
             "60_expansao", "70_admin", "80_painel", "90_cliente", "95_mensagens_filas",
             "97_suspensao"]


def consultar(sql: str) -> None:
    pedido = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{os.environ['SUPABASE_PROJECT_REF']}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {os.environ['SUPABASE_ACCESS_TOKEN']}",
                 "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(pedido, timeout=300):
            pass
    except urllib.error.HTTPError as e:
        raise RuntimeError(e.read().decode()) from None


def sem_psql(texto: str) -> str:
    return "\n".join(l for l in texto.splitlines() if not l.lstrip().startswith("\\"))


def main() -> int:
    dados = (PASTA / "05_dados_teste.sql").read_text(encoding="utf-8")
    apoio = dados.split("-- Utilizadores", 1)[0]
    consultar("drop schema if exists teste cascade;\n" + sem_psql(apoio))
    total = 0
    try:
        for nome in FICHEIROS:
            sql = (PASTA / f"{nome}.sql").read_text(encoding="utf-8")
            n = len(re.findall(r"teste\.(ok|erro|zero)\(", sql))
            consultar(sem_psql(sql))
            total += n
            print(f"ok   {nome}: {n}")
    except RuntimeError as e:
        print(f"FALHOU em {nome}: {e}")
        return 1
    finally:
        consultar("drop schema if exists teste cascade;")
    print(f"{total} verificações a passar no ensaio")
    return 0


if __name__ == "__main__":
    sys.exit(main())
