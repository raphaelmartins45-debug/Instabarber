import { corDoTexto, razaoContraste } from "@/lib/regras/contraste";

// Cor de marca da barbearia nos painéis (D-134): helpers puros de apresentação. A cor nunca fica
// ilegível: se o contraste não chegar ao mínimo, aproxima-se do branco (fundo escuro) ou do preto
// (fundo claro) até chegar. Não mexe em dados nem em regras de negócio.

const HEX = /^#[0-9a-f]{6}$/i;

export const FUNDO_ESCURO = "#09090B";
export const CARTAO_ESCURO = "#121214";
export const FUNDO_CLARO = "#FAFAF9";
export const CARTAO_CLARO = "#FFFFFF";

/** Mínimos WCAG: texto corrente 4,5:1; elementos de interface (botões, anéis) 3:1. */
export const MINIMO_TEXTO = 4.5;
export const MINIMO_INTERFACE = 3;

export const corValida = (cor: string | null | undefined): cor is string => !!cor && HEX.test(cor);

const canais = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const paraHex = (c: number[]) =>
  `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase();

/** Mistura `cor` com `alvo` na proporção t (0 = cor, 1 = alvo). */
export function misturar(cor: string, alvo: string, t: number): string {
  const a = canais(cor);
  const b = canais(alvo);
  return paraHex(a.map((v, i) => v + (b[i]! - v) * t));
}

/** «r,g,b» para usar em rgba(var(--ac-rgb), …). */
export const rgbDe = (hex: string) => canais(hex).join(",");

/**
 * A cor mais próxima da original que tem pelo menos `minimo` de contraste com `fundo`. Num fundo
 * escuro, clareia; num fundo claro, escurece. Devolve a original se já chegar.
 */
export function ajustarDestaque(cor: string, fundo: string, minimo: number = MINIMO_TEXTO): string {
  const alvo =
    razaoContraste(fundo, "#FFFFFF") > razaoContraste(fundo, "#000000") ? "#FFFFFF" : "#000000";
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const tentativa = t === 0 ? cor.toUpperCase() : misturar(cor, alvo, t);
    if (razaoContraste(tentativa, fundo) >= minimo) return tentativa;
  }
  return alvo;
}

/** As variáveis CSS do destaque «Marca da barbearia», nos dois modos. */
export function variaveisMarca(cor: string): Record<string, string> {
  const botaoEscuro = ajustarDestaque(cor, FUNDO_ESCURO, MINIMO_INTERFACE);
  const botaoClaro = ajustarDestaque(cor, FUNDO_CLARO, MINIMO_INTERFACE);
  return {
    "--marca-escuro": botaoEscuro,
    "--marca-escuro-hi": misturar(botaoEscuro, "#FFFFFF", 0.14),
    "--marca-escuro-sobre": corDoTexto(botaoEscuro),
    "--marca-escuro-rgb": rgbDe(botaoEscuro),
    "--marca-escuro-texto": ajustarDestaque(cor, CARTAO_ESCURO, MINIMO_TEXTO),
    "--marca-claro": botaoClaro,
    "--marca-claro-hi": misturar(botaoClaro, "#000000", 0.1),
    "--marca-claro-sobre": corDoTexto(botaoClaro),
    "--marca-claro-rgb": rgbDe(botaoClaro),
    "--marca-claro-texto": ajustarDestaque(cor, CARTAO_CLARO, MINIMO_TEXTO),
  };
}
