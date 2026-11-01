import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ESQUEMAS_SEPARADOR } from "@/lib/validacao/ficha-barbearia";
import { camposDe, SEPARADORES, valoresDe } from "./ficha";

const rotulos = {
  planos: { basic: "Basic", pro: "Pro" },
  periodicidades: { mensal: "M", anual: "A" },
  pagamentos: { em_dia: "E", em_atraso: "A" },
  slugAjuda: "",
  dominioAjuda: "",
};

/** As chaves do objeto por baixo dos .refine(). */
function forma(esquema: z.ZodTypeAny): Record<string, unknown> {
  // No Zod 4, os .refine() ficam no próprio objeto: a forma lê-se diretamente.
  return (esquema as z.ZodObject).shape;
}

describe("ficha da barbearia (E.1)", () => {
  it("tem onze separadores (o registo de apoio, D-160)", () => {
    expect(SEPARADORES).toHaveLength(11);
  });

  it("cada campo de formulário existe no esquema do seu separador", () => {
    for (const [separador, esquema] of Object.entries(ESQUEMAS_SEPARADOR)) {
      const chaves = Object.keys(forma(esquema));
      for (const campo of camposDe(separador as keyof typeof ESQUEMAS_SEPARADOR, rotulos)) {
        expect(chaves).toContain(campo.nome);
      }
    }
  });

  it("valores: nulos a vazio e horas sem segundos", () => {
    const campos = camposDe("horario", rotulos);
    const v = valoresDe(
      {
        hora_abertura: "09:00:00",
        intervalo_almoco_inicio: null,
        dias_descanso: [0, 1],
        aberto: true,
      },
      campos,
    );
    expect(v).toMatchObject({
      hora_abertura: "09:00",
      intervalo_almoco_inicio: "",
      dias_descanso: [0, 1],
      aberto: true,
    });
  });
});
