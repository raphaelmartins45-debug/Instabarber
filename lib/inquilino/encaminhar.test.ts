import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  caminhoEntradaEquipa,
  enderecoPublico,
  caminhoSeguro,
  encaminhar,
  hostResolvido,
  type HostResolvido,
} from "./encaminhar";
import { CAMINHOS_RESERVADOS, classificarHost, slugValido } from "./host";

const principal: HostResolvido = { tipo: "principal" };
const barbearia: HostResolvido = { tipo: "barbearia", slug: "barbearia-central" };

describe("classificarHost", () => {
  it("domínio principal, www e pré-visualizações da Vercel", () => {
    expect(classificarHost("instabarber.pt", "instabarber.pt")).toEqual({ tipo: "principal" });
    expect(classificarHost("WWW.instabarber.pt", "instabarber.pt")).toEqual({ tipo: "principal" });
    expect(classificarHost("instabarber-git-x.vercel.app", "instabarber.pt")).toEqual({
      tipo: "principal",
    });
    expect(classificarHost("localhost:3000", "localhost")).toEqual({ tipo: "principal" });
  });

  it("subdomínio de barbearia, mesmo quando o slug é reservado", () => {
    expect(classificarHost("barbearia-central.instabarber.pt", "instabarber.pt")).toEqual({
      tipo: "subdominio",
      slug: "barbearia-central",
    });
    expect(classificarHost("admin.instabarber.pt", "instabarber.pt")).toEqual({
      tipo: "subdominio",
      slug: "admin",
    });
    expect(classificarHost("barbearia-a.localhost:3000", "localhost")).toEqual({
      tipo: "subdominio",
      slug: "barbearia-a",
    });
  });

  it("qualquer outro host é um domínio próprio", () => {
    expect(classificarHost("barbeariacentral.pt", "instabarber.pt")).toEqual({
      tipo: "dominio",
      dominio: "barbeariacentral.pt",
    });
  });
});

describe("encaminhar no domínio principal", () => {
  it("a landing, a equipa e a administração seguem sem barbearia", () => {
    expect(encaminhar(principal, "/")).toMatchObject({ acao: "seguir", destino: "/", slug: null });
    expect(encaminhar(principal, "/entrar")).toMatchObject({ destino: "/entrar", zona: "publica" });
    expect(encaminhar(principal, "/app/sistema")).toMatchObject({ zona: "equipa", slug: null });
    expect(encaminhar(principal, "/admin")).toMatchObject({ zona: "admin" });
    expect(encaminhar(principal, "/robots.txt")).toMatchObject({ destino: "/robots.txt" });
  });

  it("/<slug> abre a barbearia, com as ligações prefixadas", () => {
    expect(encaminhar(principal, "/barbearia-central")).toEqual({
      acao: "seguir",
      destino: "/b/barbearia-central",
      slug: "barbearia-central",
      base: "/barbearia-central",
      zona: "publica",
    });
    expect(encaminhar(principal, "/barbearia-central/minha-area")).toMatchObject({
      destino: "/b/barbearia-central/minha-area",
      zona: "cliente",
    });
  });

  it("a rota interna /b/ não se vê de fora", () => {
    expect(encaminhar(principal, "/b/barbearia-central")).toEqual({ acao: "nao_encontrado" });
    expect(encaminhar(barbearia, "/b")).toEqual({ acao: "nao_encontrado" });
  });
});

describe("encaminhar no endereço da barbearia", () => {
  it("/admin responde 404", () => {
    expect(encaminhar(barbearia, "/admin")).toEqual({ acao: "nao_encontrado" });
    expect(encaminhar(barbearia, "/admin/barbearias")).toEqual({ acao: "nao_encontrado" });
  });

  it("as páginas públicas vão para /b/<slug>", () => {
    expect(encaminhar(barbearia, "/")).toMatchObject({
      destino: "/b/barbearia-central",
      base: "",
      zona: "publica",
    });
    expect(encaminhar(barbearia, "/entrar")).toMatchObject({
      destino: "/b/barbearia-central/entrar",
    });
    expect(encaminhar(barbearia, "/minha-area")).toMatchObject({ zona: "cliente" });
  });

  it("a equipa entra em /app/entrar e usa o /app com a barbearia do endereço", () => {
    expect(encaminhar(barbearia, "/app/entrar")).toMatchObject({
      destino: "/entrar",
      slug: "barbearia-central",
    });
    expect(encaminhar(barbearia, "/app/entrar/confirmar")).toMatchObject({
      destino: "/entrar/confirmar",
    });
    expect(encaminhar(barbearia, "/app")).toMatchObject({ destino: "/app", zona: "equipa" });
    expect(encaminhar(barbearia, "/api/acesso")).toMatchObject({ destino: "/api/acesso" });
  });
});

describe("auxiliares", () => {
  it("domínio próprio desconhecido dá um slug inválido", () => {
    expect(hostResolvido({ tipo: "dominio", dominio: "x.pt" }, null)).toEqual({
      tipo: "barbearia",
      slug: "_",
    });
    expect(slugValido("_")).toBe(false);
  });

  it("entrada da equipa conforme o endereço", () => {
    expect(caminhoEntradaEquipa(principal)).toBe("/entrar");
    expect(caminhoEntradaEquipa(barbearia)).toBe("/app/entrar");
  });

  it("caminhoSeguro recusa endereços externos", () => {
    expect(caminhoSeguro("/app/sistema", "/app")).toBe("/app/sistema");
    expect(caminhoSeguro("//mau.pt", "/app")).toBe("/app");
    expect(caminhoSeguro("https://mau.pt", "/app")).toBe("/app");
    expect(caminhoSeguro("/\\mau.pt", "/app")).toBe("/app");
    expect(caminhoSeguro(null, "/app")).toBe("/app");
  });

  it("os caminhos reservados são os mesmos que a base de dados recusa como slug", () => {
    const sql = readFileSync("docs/esquema/01_tabelas.sql", "utf8");
    const lista = /slug not in \(([^)]+)\)/.exec(sql)?.[1] ?? "";
    const daBase = [...lista.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
    expect([...CAMINHOS_RESERVADOS].sort()).toEqual(daBase);
  });
});

describe("enderecoPublico", () => {
  const o = "https://instabarber.pt";
  it("em instabarber.pt/<slug> mantém o slug (e-mail de confirmação, D-167)", () => {
    expect(enderecoPublico(o, { slug: "alfa", base: "/alfa" }, "alfa")).toBe(`${o}/alfa`);
  });
  it("no subdomínio, só a origem", () => {
    const sub = "https://alfa.instabarber.pt";
    expect(enderecoPublico(sub, { slug: "alfa", base: "" }, "alfa")).toBe(sub);
  });
  it("fora do endereço da barbearia (painel), /<slug>", () => {
    expect(enderecoPublico(o, { slug: null, base: "" }, "alfa")).toBe(`${o}/alfa`);
  });
});
