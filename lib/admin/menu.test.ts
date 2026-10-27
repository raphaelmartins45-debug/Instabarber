import { describe, expect, it } from "vitest";
import { planificar } from "@/lib/funcionalidades/menus";
import { MENU_ADMIN, menuDoPapel, separadorAtual } from "./menu";

describe("separadorAtual", () => {
  it("escolhe o separador pelo prefixo do caminho", () => {
    expect(separadorAtual("/admin")).toBe("inicio");
    expect(separadorAtual("/admin/barbearias/123/identidade")).toBe("barbearias");
    expect(separadorAtual("/admin/pedidos")).toBe("pedidos");
  });

  it("reconhece as entradas de dentro da pasta «Gestão do negócio»", () => {
    expect(separadorAtual("/admin/comercial")).toBe("comercial");
    expect(separadorAtual("/admin/comercial/leads/abc")).toBe("comercial");
    expect(separadorAtual("/admin/financas/custos")).toBe("financas");
    expect(separadorAtual("/admin/vendas")).toBe("vendas");
  });
});

describe("planificar", () => {
  it("troca cada pasta pelas suas entradas, pela ordem", () => {
    const ids = planificar(MENU_ADMIN).map((i) => i.id);
    expect(ids).toContain("comercial");
    expect(ids).not.toContain("negocio");
    expect(ids.indexOf("comercial")).toBeGreaterThan(ids.indexOf("modulos"));
  });
});

describe("menuDoPapel", () => {
  const ids = (p: Parameters<typeof menuDoPapel>[0]) => planificar(menuDoPapel(p)).map((i) => i.id);

  it("o dono tem a equipa; o gestor não", () => {
    expect(ids("super_admin")).toContain("equipa");
    expect(ids("gestor_plataforma")).not.toContain("equipa");
    expect(ids("gestor_plataforma")).toContain("financas");
  });

  it("o comercial tem o Comercial, o Apoio às vendas e o desempenho", () => {
    expect(ids("comercial")).toEqual(["comercial", "vendas", "desempenho"]);
    expect(ids("gestor_plataforma")).toContain("vendas");
    expect(separadorAtual("/admin/comercial/desempenho", menuDoPapel("comercial"))).toBe(
      "desempenho",
    );
  });
});
