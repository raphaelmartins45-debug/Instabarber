import { describe, expect, it } from "vitest";
import {
  assinaturaApoio,
  assinaturaComercial,
  linhasDaAssinatura,
  telefoneParaMostrar,
} from "./assinatura";

const recurso = { telefone: "+351 900 000 000", email: "comercial@instabarber.pt" };

describe("assinatura dos documentos (D-184)", () => {
  it("o dono e o gestor assinam como «Gestor comercial»; o comercial como «Comercial»", () => {
    const perfil = { nome: "Raphael Martins", telefone: "+351912345678", email: "r@x.pt" };
    expect(assinaturaComercial({ ...perfil, papel: "super_admin" }, recurso)).toEqual({
      nome: "Raphael Martins",
      cargo: "Gestor comercial",
      telefone: "912 345 678",
      email: "r@x.pt",
    });
    expect(assinaturaComercial({ ...perfil, papel: "gestor_plataforma" }, recurso).cargo).toBe(
      "Gestor comercial",
    );
    expect(assinaturaComercial({ ...perfil, papel: "comercial" }, recurso).cargo).toBe("Comercial");
  });

  it("sem telefone no registo usa o da equipa comercial; sem nome fica a marca, sem cargo", () => {
    const a = assinaturaComercial(
      { nome: " ", papel: "comercial", telefone: null, email: null },
      recurso,
    );
    expect(a).toEqual({
      nome: "Comercial InstaBarber",
      cargo: null,
      telefone: "900 000 000",
      email: "comercial@instabarber.pt",
    });
    expect(assinaturaComercial(null, recurso).nome).toBe("Comercial InstaBarber");
  });

  it("os manuais assinam «Apoio ao cliente», com o WhatsApp e o e-mail do apoio", () => {
    const a = assinaturaApoio("351912345678");
    expect(a).toEqual({
      nome: "Apoio ao cliente",
      cargo: null,
      telefone: "912 345 678",
      email: "apoio@instabarber.pt",
    });
    expect(linhasDaAssinatura(a)).toEqual(["912 345 678", "apoio@instabarber.pt"]);
  });

  it("telefone inválido ou vazio não aparece", () => {
    expect(telefoneParaMostrar("abc")).toBeNull();
    expect(telefoneParaMostrar(null)).toBeNull();
    expect(telefoneParaMostrar("+44 7911 123456")).toBe("+447911123456");
  });
});
