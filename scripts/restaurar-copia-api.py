#!/usr/bin/env python3
"""Restauro de uma cópia feita por scripts/copia-api.py (L.7, P-14; D-148).

O alvo é uma base vazia com as mesmas migrações (o Supabase local depois de `supabase db reset`,
ou um projeto novo). Nunca a produção: recusa se o endereço tiver PRODUCAO_DB_HOST ou o ref da
produção. Decifra, confere as somas, esvazia o que as migrações carregaram, repõe as tabelas sem
gatilhos nem chaves estrangeiras (session_replication_role = replica), numa só transação, e no
fim compara as contagens com o manifesto e confere o RLS.

Uso: ALVO_DB_URL=postgresql://… COPIA_SENHA=… python3 scripts/restaurar-copia-api.py ficheiro.gpg
"""
import hashlib
import json
import os
import subprocess
import sys
import tarfile
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def psql(alvo: str, *args: str, entrada: str | None = None) -> str:
    r = subprocess.run(["psql", alvo, "-v", "ON_ERROR_STOP=1", "-At", *args],
                       input=entrada, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"psql falhou: {r.stderr[:500]}")
    return r.stdout


def colunas(alvo: str, tabela: str) -> list[str]:
    esquema, nome = tabela.split(".")
    sql = (f"select column_name from information_schema.columns where table_schema = '{esquema}' "
           f"and table_name = '{nome}' and is_generated = 'NEVER' order by ordinal_position")
    return [c for c in psql(alvo, "-c", sql).splitlines() if c]


def main() -> None:
    ficheiro = sys.argv[1]
    alvo = os.environ["ALVO_DB_URL"]
    proibidos = [os.environ.get("PRODUCAO_DB_HOST"), os.environ.get("SUPABASE_PRODUCAO_REF")]
    if any(p and p in alvo for p in proibidos):
        sys.exit("Recusado: o alvo é a produção.")
    with tempfile.TemporaryDirectory() as tmp:
        arquivo = os.path.join(tmp, "copia.tar.gz")
        subprocess.run(["gpg", "--batch", "--quiet", "--pinentry-mode", "loopback",
                        "--passphrase-fd", "0", "--output", arquivo, "--decrypt", ficheiro],
                       input=os.environ["COPIA_SENHA"].encode(), check=True)
        with tarfile.open(arquivo) as tar:
            tar.extractall(tmp, filter="data")
        pasta = next(os.path.join(tmp, d) for d in os.listdir(tmp) if d.startswith("copia-"))
        for linha in open(os.path.join(pasta, "SHA256SUMS")):
            soma, nome = linha.split()
            with open(os.path.join(pasta, nome), "rb") as f:
                if hashlib.sha256(f.read()).hexdigest() != soma:
                    sys.exit(f"Soma errada: {nome}")
        manifesto = json.load(open(os.path.join(pasta, "manifesto.json")))
        partes = ["begin;", open(os.path.join(RAIZ, "scripts/sql/esvaziar-para-restauro.sql")).read(),
                  "delete from auth.users;", "set local session_replication_role = replica;"]
        for tabela in manifesto["contagens"]:
            dados = open(os.path.join(pasta, f"{tabela}.json"), encoding="utf-8").read()
            if dados == "[]":
                continue
            lista = ", ".join(f'"{c}"' for c in colunas(alvo, tabela))
            etiqueta = "$copia$"
            if etiqueta in dados:
                sys.exit(f"A etiqueta {etiqueta} aparece nos dados de {tabela}.")
            partes.append(f"insert into {tabela} ({lista}) select {lista} from "
                          f"json_populate_recordset(null::{tabela}, {etiqueta}{dados}{etiqueta});")
        partes.append("commit;")
        psql(alvo, "-q", "-o", "/dev/null", entrada="\n".join(partes))
    diferencas = []
    for tabela, esperado in manifesto["contagens"].items():
        real = int(psql(alvo, "-c", f"select count(*) from {tabela}").strip())
        if real != esperado:
            diferencas.append(f"{tabela}: cópia {esperado}, restauro {real}")
    print(psql(alvo, "-F", " | ", "-f", os.path.join(RAIZ, "scripts/sql/verificar-rls.sql")).strip())
    if diferencas:
        sys.exit("Contagens diferentes:\n" + "\n".join(diferencas))
    total = sum(manifesto["contagens"].values())
    print(f"Restauro certo: {len(manifesto['contagens'])} tabelas, {total} linhas, "
          f"cópia de {manifesto['data']} (migrações até {manifesto['migracoes'][-1]}).")


if __name__ == "__main__":
    main()
