import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { paraCsv } from "./csv";
import { TABELAS_DA_BARBEARIA, TABELAS_DA_PLATAFORMA, TABELAS_DO_CLIENTE } from "./tabelas";
import { criarZip } from "./zip";

const sql = readFileSync("docs/esquema/01_tabelas.sql", "utf8");
const tabelasCom = (coluna: string) =>
  [...sql.matchAll(/create table (\w+) \(([\s\S]*?)\n\);/g)]
    .filter((m) => new RegExp(`^\\s*${coluna}\\s`, "m").test(m[2]!))
    .map((m) => m[1]!);

describe("exportação dos dados (E.1)", () => {
  it("cada tabela com inquilino_id está classificada uma vez: da barbearia ou da plataforma", () => {
    const classificadas = [...TABELAS_DA_BARBEARIA, ...TABELAS_DA_PLATAFORMA];
    expect(new Set(classificadas).size).toBe(classificadas.length);
    expect([...classificadas].sort()).toEqual(tabelasCom("inquilino_id").sort());
  });

  it("a exportação de um cliente cobre as tabelas da barbearia com cliente_id", () => {
    const daBarbearia = new Set<string>(TABELAS_DA_BARBEARIA);
    expect([...TABELAS_DO_CLIENTE].sort()).toEqual(
      tabelasCom("cliente_id")
        .filter((t) => daBarbearia.has(t))
        .sort(),
    );
  });

  it("CSV com «;», aspas e JSON", () => {
    expect(paraCsv([{ a: 'x;"y"', b: null, c: [1, 2] }])).toBe(
      '\uFEFFa;b;c\r\n"x;""y""";;[1,2]\r\n',
    );
  });

  it("o ZIP tem os ficheiros e o conteúdo descomprime igual", () => {
    const zip = criarZip([{ nome: "clientes.csv", conteudo: "nome\r\nAna\r\n" }]);
    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    const tamanho = zip.readUInt32LE(18);
    const nome = zip.readUInt16LE(26);
    expect(zip.subarray(30, 30 + nome).toString()).toBe("clientes.csv");
    expect(inflateRawSync(zip.subarray(30 + nome, 30 + nome + tamanho)).toString()).toBe(
      "nome\r\nAna\r\n",
    );
    expect(zip.readUInt32LE(zip.length - 22)).toBe(0x06054b50);
  });
});
