#!/usr/bin/env python3
"""Testes SQL no projeto de ensaio pela Management API do Supabase (L.8, passo 2; D-111).

Sem ligação à porta 5432: cada ficheiro vai num pedido, sem as linhas do psql (\\set…). Os dados
de teste do ficheiro 05 já estão no ensaio; aqui só se criam as funções de apoio (esquema
`teste`) e no fim apagam-se. A API não devolve os NOTICE: conta-se o número de verificações de
cada ficheiro e uma falha devolve «FALHOU: …» e para.

Cada ficheiro corre numa transação exterior que é sempre desfeita (os begin/rollback do ficheiro
passam a savepoints): nada fica gravado. Põe de lado, dentro dessa transação, os 3 registos da
validação manual de 22/10/2026 que contrariam os dados de teste, e confirma no fim que lá estão.

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
             "96_apoio_comunicados", "96b_equipa_plataforma", "96c_painel_comercial", "96d_comprovativos", "96e_prospecao", "97_suspensao", "98_comercial_site", "99_retencao"]


def consultar(sql: str):
    pedido = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{os.environ['SUPABASE_PROJECT_REF']}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {os.environ['SUPABASE_ACCESS_TOKEN']}",
                 "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(pedido, timeout=300) as r:
            return json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        raise RuntimeError(e.read().decode()) from None


# Projeto de ensaio (nunca a produção, que não tem os dados de teste).
REF_ENSAIO = "msjbcosrgastzaixhtyp"
POR_DE_LADO = """
delete from public.marcacoes where id = '8128f957-ee72-441f-beba-d640490a9a5a';
delete from public.clientes where id = 'e3f0e3ff-e9bb-4f29-afcf-3d46354286f2';
delete from auth.users where id = '61886ed6-2fb2-4645-978a-eae0373a383c';
"""


def sem_psql(texto: str) -> str:
    return "\n".join(l for l in texto.splitlines() if not l.lstrip().startswith("\\"))


def com_savepoints(texto: str) -> str:
    texto = re.sub(r"(?m)^begin;\s*$", "savepoint bloco;", texto)
    return re.sub(r"(?m)^rollback;\s*$", "rollback to savepoint bloco;", texto)


def main() -> int:
    if os.environ.get("SUPABASE_PROJECT_REF") != REF_ENSAIO:
        print("Recusado: só corre no projeto de ensaio (SUPABASE_PROJECT_REF).")
        return 2
    dados = (PASTA / "05_dados_teste.sql").read_text(encoding="utf-8")
    apoio = dados.split("-- Utilizadores", 1)[0]
    consultar("drop schema if exists teste cascade;\n" + sem_psql(apoio))
    total = 0
    try:
        for nome in FICHEIROS:
            sql = (PASTA / f"{nome}.sql").read_text(encoding="utf-8")
            n = len(re.findall(r"teste\.(ok|erro|zero)\(", sql))
            consultar("begin;\n" + POR_DE_LADO + com_savepoints(sem_psql(sql)) + "\nrollback;")
            total += n
            print(f"ok   {nome}: {n}")
    except RuntimeError as e:
        print(f"FALHOU em {nome}: {e}")
        return 1
    finally:
        consultar("drop schema if exists teste cascade;")
    print(consultar(
        "select (select count(*) from public.clientes where id = 'e3f0e3ff-e9bb-4f29-afcf-3d46354286f2') as cliente,"
        " (select count(*) from public.marcacoes where id = '8128f957-ee72-441f-beba-d640490a9a5a') as marcacao,"
        " (select count(*) from auth.users where id = '61886ed6-2fb2-4645-978a-eae0373a383c') as conta"))
    print(f"{total} verificações a passar no ensaio")
    return 0


if __name__ == "__main__":
    sys.exit(main())
