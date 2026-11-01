import { describe, expect, it } from "vitest";
import { esquemaPlaca } from "@/lib/validacao/placa";
import { sugestaoPlaca } from "./placa";

describe("sugestaoPlaca (D-185)", () => {
  it("com selos e prémio: modelo Selos e a vantagem diz o prémio", () => {
    const s = sugestaoPlaca({ selosAtivos: true, selosNecessarios: 10, premio: "Corte" });
    expect(s.modelo).toBe("selos");
    expect(s.titulo).toContain("selos");
    expect(s.vantagem).toBe("Ao 10.º selo, Corte oferecido");
  });

  it("com selos sem prémio, e sem selos", () => {
    expect(sugestaoPlaca({ selosAtivos: true, selosNecessarios: 8, premio: null }).vantagem).toBe(
      "Um selo em cada serviço",
    );
    const s = sugestaoPlaca({ selosAtivos: false, selosNecessarios: 10, premio: "Corte" });
    expect(s.modelo).toBe("cor");
    expect(s.titulo).not.toContain("selo");
  });

  it("as sugestões cabem nos limites do formulário", () => {
    for (const selosAtivos of [true, false])
      expect(
        esquemaPlaca.safeParse(
          sugestaoPlaca({ selosAtivos, selosNecessarios: 10, premio: "Corte e barba" }),
        ).success,
      ).toBe(true);
    expect(
      esquemaPlaca.safeParse({ modelo: "x", titulo: "a", frase: "", vantagem: "" }).success,
    ).toBe(false);
  });
});
