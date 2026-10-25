#!/usr/bin/env python3
"""Cópia de segurança pela Management API do Supabase (L.7, P-13; D-148).

Para quando não há acesso à porta 5432 (D-111): lê os dados de public, das contas (auth.users,
identities, mfa_factors) e do Storage (buckets e metadados dos objetos) em JSON, tabela a tabela,
e junta um manifesto com as contagens e as migrações. O esquema não vai na cópia: vem das
migrações do repositório (supabase/migrations), que o manifesto identifica.
O resultado sai num único ficheiro cifrado (GPG, AES-256, palavra-passe em COPIA_SENHA).

Uso: SUPABASE_COPIA_REF=… SUPABASE_COPIA_TOKEN=… COPIA_SENHA=… python3 scripts/copia-api.py [pasta]
Os ficheiros do Storage (logótipos, fotografias) copiam-se à parte.
"""
import datetime
import hashlib
import json
import os
import subprocess
import sys
import tarfile
import tempfile
import urllib.error
import urllib.request

LOTE = 2000
AUTH = ("users", "identities", "mfa_factors")
STORAGE = ("buckets", "objects")


def consulta(ref: str, token: str, sql: str):
    pedido = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ref}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(pedido, timeout=300) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Erro {e.code} na consulta: {e.read().decode()[:300]}")


def tabelas(ref: str, token: str) -> list[str]:
    sql = f"""select table_schema || '.' || table_name as t from information_schema.tables
      where table_type = 'BASE TABLE' and (table_schema = 'public'
        or (table_schema = 'auth' and table_name in {AUTH})
        or (table_schema = 'storage' and table_name in {STORAGE}))
      order by 1"""
    return [l["t"] for l in consulta(ref, token, sql)]


def ler_tabela(ref: str, token: str, tabela: str) -> list[dict]:
    linhas, inicio = [], 0
    while True:
        sql = (f"select coalesce(json_agg(t), '[]'::json) as l from "
               f"(select * from {tabela} order by ctid limit {LOTE} offset {inicio}) t")
        lote = consulta(ref, token, sql)[0]["l"]
        linhas += lote
        if len(lote) < LOTE:
            return linhas
        inicio += LOTE


def main() -> None:
    ref = os.environ["SUPABASE_COPIA_REF"]
    token = os.environ["SUPABASE_COPIA_TOKEN"]
    senha = os.environ["COPIA_SENHA"]
    destino = sys.argv[1] if len(sys.argv) > 1 else "copias"
    agora = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H%M%SZ")
    os.makedirs(destino, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        pasta = os.path.join(tmp, f"copia-{agora}")
        os.makedirs(pasta)
        contagens = {}
        for t in tabelas(ref, token):
            linhas = ler_tabela(ref, token, t)
            contagens[t] = len(linhas)
            with open(os.path.join(pasta, f"{t}.json"), "w", encoding="utf-8") as f:
                json.dump(linhas, f, ensure_ascii=False)
        migracoes = [l["version"] for l in consulta(
            ref, token, "select version from supabase_migrations.schema_migrations order by 1")]
        manifesto = {"projeto": ref, "data": agora, "migracoes": migracoes, "contagens": contagens}
        with open(os.path.join(pasta, "manifesto.json"), "w", encoding="utf-8") as f:
            json.dump(manifesto, f, ensure_ascii=False, indent=1)
        with open(os.path.join(pasta, "SHA256SUMS"), "w") as somas:
            for nome in sorted(os.listdir(pasta)):
                if nome != "SHA256SUMS":
                    with open(os.path.join(pasta, nome), "rb") as f:
                        somas.write(f"{hashlib.sha256(f.read()).hexdigest()}  {nome}\n")
        arquivo = os.path.join(tmp, "copia.tar.gz")
        with tarfile.open(arquivo, "w:gz") as tar:
            tar.add(pasta, arcname=os.path.basename(pasta))
        saida = os.path.join(destino, f"instabarber-copia-{agora}.tar.gz.gpg")
        subprocess.run(
            ["gpg", "--batch", "--yes", "--quiet", "--pinentry-mode", "loopback", "--symmetric",
             "--cipher-algo", "AES256", "--passphrase-fd", "0", "--output", saida, arquivo],
            input=senha.encode(), check=True)
    total = sum(contagens.values())
    print(f"{saida}  ({len(contagens)} tabelas, {total} linhas, migrações {migracoes[-1]})")


if __name__ == "__main__":
    main()
