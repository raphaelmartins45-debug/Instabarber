import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { razaoContraste } from "@/lib/regras/contraste";

// Contraste AA (4,5:1) de cada par de texto do sistema de design, lido do próprio globals.css:
// se alguém mudar um token para um valor ilegível, este teste falha (D-134).

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf-8");

function bloco(seletor: string): Record<string, string> {
  const inicio = css.indexOf(`${seletor} {`);
  if (inicio < 0) throw new Error(`Sem bloco ${seletor}`);
  const corpo = css.slice(inicio, css.indexOf("}", inicio));
  return Object.fromEntries(
    [...corpo.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1]!, m[2]!]),
  );
}

const escuro = bloco(":root");
const claro = { ...escuro, ...bloco(':root[data-modo="claro"]') };
const temas = {
  "escuro + ouro": escuro,
  "claro + ouro": claro,
  "escuro + neon": { ...escuro, ...bloco(':root[data-destaque="neon"]') },
  "claro + neon": {
    ...claro,
    ...bloco(':root[data-destaque="neon"]'),
    ...bloco(':root[data-modo="claro"][data-destaque="neon"]'),
  },
};

const superficies = ["--sup-fundo", "--sup-cartao", "--sup-elevado"];
const textos = [
  "--texto",
  "--texto-2",
  "--texto-3",
  "--ac-texto",
  "--sucesso",
  "--perda",
  "--alerta",
];

describe("tokens do sistema de design (D-134)", () => {
  for (const [nome, t] of Object.entries(temas)) {
    it(`${nome}: todo o texto tem pelo menos 4,5:1 nas superfícies`, () => {
      for (const s of superficies)
        for (const x of textos) {
          const r = razaoContraste(t[x]!, t[s]!);
          expect(r, `${x} ${t[x]} sobre ${s} ${t[s]}: ${r.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
        }
    });
    it(`${nome}: o texto sobre o botão de destaque tem pelo menos 4,5:1`, () => {
      expect(razaoContraste(t["--ac-sobre"]!, t["--ac"]!)).toBeGreaterThanOrEqual(4.5);
    });
  }
  it("o texto secundário chega ao AA também na camada mais funda", () => {
    expect(razaoContraste(escuro["--texto-2"]!, escuro["--sup-camada"]!)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(razaoContraste(claro["--texto-2"]!, claro["--sup-camada"]!)).toBeGreaterThanOrEqual(4.5);
  });
});
