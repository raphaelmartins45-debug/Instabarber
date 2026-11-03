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
    .map((c) =>
      `#${hex(Math.round(c.r / c.n))}${hex(Math.round(c.g / c.n))}${hex(Math.round(c.b / c.n))}`.toUpperCase(),
    );
}

/**
 * A cor de fundo de um logótipo (D-198): a média da orla da imagem, se a orla for quase toda de
 * uma só cor; nulo se for transparente ou variada (então fica a cor da barbearia à volta).
 * Pixéis RGBA de uma imagem `largura`×`altura`, como os de um canvas.
 */
export function fundoDoLogo(
  pixeis: ArrayLike<number>,
  largura: number,
  altura: number,
): string | null {
  const orla: [number, number, number][] = [];
  for (let y = 0; y < altura; y++)
    for (let x = 0; x < largura; x++) {
      if (x !== 0 && y !== 0 && x !== largura - 1 && y !== altura - 1) continue;
      const i = (y * largura + x) * 4;
      if (pixeis[i + 3]! < 200) return null;
      orla.push([pixeis[i]!, pixeis[i + 1]!, pixeis[i + 2]!]);
    }
  if (orla.length === 0) return null;
  const media = [0, 1, 2].map((c) => orla.reduce((s, p) => s + p[c]!, 0) / orla.length);
  const perto = orla.filter((p) => p.every((v, c) => Math.abs(v - media[c]!) <= 24)).length;
  if (perto / orla.length < 0.9) return null;
  return `#${media.map((v) => hex(Math.round(v))).join("")}`.toUpperCase();
}
