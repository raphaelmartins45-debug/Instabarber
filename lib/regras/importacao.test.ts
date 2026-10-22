import { describe, expect, it } from "vitest";
import { lerCsv, validarClientes, validarServicos } from "./importacao";

describe("lerCsv", () => {
  it("aceita ponto e vírgula, aspas e BOM", () => {
    expect(lerCsv('﻿nome;notas\r\n"Silva; João";"diz ""olá"""\r\n')).toEqual([
      ["nome", "notas"],
      ["Silva; João", 'diz "olá"'],
    ]);
    expect(lerCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("validarClientes", () => {
  it("só passam as linhas válidas; as outras dizem a linha e o motivo", () => {
    const csv = lerCsv(
      [
        "Nome;Telemóvel;Email;Data de nascimento;Notas",
        "Ana;912 000 001;ana@x.pt;1990-05-01;",
        "Bruno;123;;;",
        "Carla;912000001;;;",
        "Duarte;912000003;;31/02/1990;",
        "Eva;912000004;;01/03/1985;cliente antiga",
        ";912000005;;;",
        "Filipe;912000006;;;",
      ].join("\n"),
    );
    const r = validarClientes(csv, new Set(["+351912000006"]));
    expect(r.validas.map((c) => c.nome)).toEqual(["Ana", "Eva"]);
    expect(r.validas[1]).toMatchObject({
      telefone: "+351912000004",
      data_nascimento: "1985-03-01",
      notas: "cliente antiga",
    });
    expect(r.erros).toEqual([
      { linha: 3, motivo: "telemovel" },
      { linha: 4, motivo: "duplicado" },
      { linha: 5, motivo: "data" },
      { linha: 7, motivo: "nome" },
      { linha: 8, motivo: "existente" },
    ]);
  });

  it("sem as colunas obrigatórias não importa nada", () => {
    expect(validarClientes(lerCsv("nome\nAna"), new Set()).erros).toEqual([
      { linha: 1, motivo: "colunas" },
    ]);
  });
});

describe("validarServicos", () => {
  it("duração de 5 a 480 minutos e preço em euros", () => {
    const r = validarServicos(
      lerCsv('nome,duracao,preco\nCorte,30,"15,00"\nBarba,2,8\nPack,60,abc'),
    );
    expect(r.validas).toEqual([{ nome: "Corte", duracao_min: 30, preco_centimos: 1500 }]);
    expect(r.erros).toEqual([
      { linha: 3, motivo: "duracao" },
      { linha: 4, motivo: "preco" },
    ]);
  });
});
