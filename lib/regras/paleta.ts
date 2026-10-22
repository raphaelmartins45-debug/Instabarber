// Paleta proposta a partir do logótipo (E.2, Marca): as cores mais frequentes, agrupadas,
// sem fundo transparente nem quase-branco ou quase-preto. O dono escolhe; nada se impõe.

const hex = (n: number) => n.toString(16).padStart(2, "0");

/** Pixéis RGBA (como os de um canvas) → até `maximo` cores «#RRGGBB», das mais frequentes. */
export function paletaDePixeis(pixeis: ArrayLike<number>, maximo = 5): string[] {
  const contagem = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i + 3 < pixeis.length; i += 4) {
    const [r, g, b, a] = [pixeis[i]!, pixeis[i + 1]!, pixeis[i + 2]!, pixeis[i + 3]!];
    if (a < 128) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (min > 235 || max < 20) continue;
    // Agrupa em caixas de 32 níveis por canal e guarda a média real de cada caixa.
    const chave = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const c = contagem.get(chave) ?? { n: 0, r: 0, g: 0, b: 0 };
    contagem.set(chave, { n: c.n + 1, r: c.r + r, g: c.g + g, b: c.b + b });
  }
  return [...contagem.values()]
    .sort((x, y) => y.n - x.n)
    .slice(0, maximo)
    .map((c) => `#${hex(Math.round(c.r / c.n))}${hex(Math.round(c.g / c.n))}${hex(Math.round(c.b / c.n))}`.toUpperCase());
}
