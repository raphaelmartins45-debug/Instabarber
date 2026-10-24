import { describe, expect, it } from "vitest";
import { filtrarVencimentos, modeloPelosDias, textoLembrete } from "./mensagens";

const base = {
  responsavel: "Marta Silva",
  barbearia: "Barbearia Alfa",
  plano: "Pro",
  valorComIva: "47,97 €",
  vencimento: "30/10/2026",
};

describe("lembretes de vencimento", () => {
  it("escolhe o modelo pelos dias que faltam", () => {
    expect(modeloPelosDias(5)).toBe("aviso");
    expect(modeloPelosDias(0)).toBe("hoje");
    expect(modeloPelosDias(-3)).toBe("atraso");
  });

  it("o aviso leva nome, barbearia, plano, valor com IVA, data, pagamento e assinatura", () => {
    const t = textoLembrete({ ...base, dias: 4 });
    expect(t).toContain("Olá Marta");
    expect(t).toContain("Barbearia Alfa (plano Pro, 47,97 € com IVA) vence a 30/10/2026");
    expect(t).toContain("MB WAY");
    expect(t.trim().endsWith("InstaBarber · Performa LAB")).toBe(true);
  });

  it("em atraso segue o escalão da P-09 e sem responsável usa o nome da barbearia", () => {
    expect(textoLembrete({ ...base, dias: -3 })).toContain("Se já pagou");
    expect(textoLembrete({ ...base, dias: -10 })).toContain("responda hoje");
    const t = textoLembrete({ ...base, responsavel: null, dias: -40 });
    expect(t).toContain("pode ser suspenso");
    expect(t).toContain("Olá Barbearia Alfa");
    expect(textoLembrete({ ...base, dias: 0 })).toContain("vence hoje");
  });

  it("filtra por próximos 7 e 15 dias, em atraso e todos", () => {
    const l = [{ dias: -2 }, { dias: 0 }, { dias: 7 }, { dias: 12 }, { dias: 30 }];
    expect(filtrarVencimentos(l, "7")).toEqual([{ dias: 0 }, { dias: 7 }]);
    expect(filtrarVencimentos(l, "15")).toHaveLength(3);
    expect(filtrarVencimentos(l, "atraso")).toEqual([{ dias: -2 }]);
    expect(filtrarVencimentos(l, "todos")).toHaveLength(5);
  });
});
