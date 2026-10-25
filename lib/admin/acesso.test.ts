import { describe, expect, it } from "vitest";
import { desvioAdmin, eAdministrador, ePapelPlataforma } from "./acesso";

describe("desvioAdmin", () => {
  it("o dono abre tudo", () => {
    for (const c of ["/admin", "/admin/equipa", "/admin/financas", "/admin/comercial/modelos"])
      expect(desvioAdmin("super_admin", c)).toBeNull();
  });

  it("o gestor abre tudo menos a equipa", () => {
    expect(desvioAdmin("gestor_plataforma", "/admin/financas/custos")).toBeNull();
    expect(desvioAdmin("gestor_plataforma", "/admin/comercial/condicoes")).toBeNull();
    expect(desvioAdmin("gestor_plataforma", "/admin/equipa")).toBe("/admin");
  });

  it("o comercial só abre o Comercial, sem modelos nem condições", () => {
    expect(desvioAdmin("comercial", "/admin/comercial")).toBeNull();
    expect(desvioAdmin("comercial", "/admin/comercial/leads/abc")).toBeNull();
    expect(desvioAdmin("comercial", "/admin/comercial/desempenho")).toBeNull();
    expect(desvioAdmin("comercial", "/admin/dois-passos")).toBeNull();
    for (const c of [
      "/admin",
      "/admin/barbearias",
      "/admin/financas",
      "/admin/comercial/modelos",
      "/admin/comercial/condicoes",
      "/admin/comercialx",
    ])
      expect(desvioAdmin("comercial", c)).toBe("/admin/comercial");
  });
});

describe("papéis", () => {
  it("reconhece os papéis da plataforma e os administradores", () => {
    expect(ePapelPlataforma("comercial")).toBe(true);
    expect(ePapelPlataforma("proprietario")).toBe(false);
    expect(eAdministrador("gestor_plataforma")).toBe(true);
    expect(eAdministrador("comercial")).toBe(false);
  });
});
