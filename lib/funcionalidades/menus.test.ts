import { describe, expect, it } from "vitest";
import { MENU_GESTAO, menuEquipa, montarMenu } from "./menus";

const ids = (itens: { id: string }[]) => itens.map((i) => i.id);

describe("montarMenu", () => {
  it("sem funcionalidades ativas ficam só as abas sempre visíveis", () => {
    expect(ids(montarMenu(MENU_GESTAO, new Set(), new Set()))).toEqual([
      "inicio",
      "sistema",
      "plano",
    ]);
  });

  it("cada chave ativa acrescenta a sua aba, pela ordem do menu", () => {
    const menu = montarMenu(MENU_GESTAO, new Set(["loja_produtos", "agenda_basica"]), new Set());
    expect(ids(menu)).toEqual(["inicio", "agenda", "loja", "sistema", "plano"]);
    expect(menu.every((i) => i.estado === "ativo")).toBe(true);
  });

  it("uma chave inativa com mostra_upgrade fica à vista com o estado upgrade", () => {
    const menu = montarMenu(
      menuEquipa("p1"),
      new Set(["agenda_basica"]),
      new Set(["metas_profissional"]),
    );
    expect(menu.map((i) => [i.id, i.estado])).toEqual([
      ["inicio", "ativo"],
      ["agenda", "ativo"],
      ["metas", "upgrade"],
      ["perfil", "ativo"],
    ]);
  });

  it("o menu do profissional aponta para a área dele", () => {
    expect(menuEquipa("abc")[1]?.href).toBe("/app/equipa/abc/agenda");
  });
});
