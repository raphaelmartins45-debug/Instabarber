// Texto sobre a capa (E.6): branco ou preto conforme o contraste, com o mínimo de 4,5:1 (WCAG).

const canal = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * canal(r!) + 0.7152 * canal(g!) + 0.0722 * canal(b!);
}

export function razaoContraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x! + 0.05) / (y! + 0.05);
}

export const BRANCO = "#FFFFFF";
export const PRETO = "#12100E";

const PRETO_PURO = "#000000";

/**
 * A cor de texto com mais contraste sobre o fundo. Nos cinzentos médios, o preto da marca e o
 * branco ficam abaixo de 4,5:1: aí usa-se o preto puro (preto puro ou branco passa sempre).
 */
export function corDoTexto(fundo: string): string {
  const melhor = razaoContraste(fundo, BRANCO) >= razaoContraste(fundo, PRETO) ? BRANCO : PRETO;
  if (razaoContraste(fundo, melhor) >= 4.5) return melhor;
  return razaoContraste(fundo, BRANCO) >= razaoContraste(fundo, PRETO_PURO) ? BRANCO : PRETO_PURO;
}
