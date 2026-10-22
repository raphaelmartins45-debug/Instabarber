// Leitura de uma imagem no browser antes de a carregar: dimensões e fundo do logótipo (D.8.1).

export async function dimensoes(
  ficheiro: File,
): Promise<{ largura: number; altura: number } | null> {
  if (ficheiro.type === "image/svg+xml") return null;
  const bitmap = await createImageBitmap(ficheiro);
  const d = { largura: bitmap.width, altura: bitmap.height };
  bitmap.close();
  return d;
}

/** Verdadeiro se os quatro cantos são brancos e opacos: o logótipo não tem fundo transparente. */
export async function temFundoBranco(ficheiro: File): Promise<boolean> {
  if (ficheiro.type === "image/svg+xml") return false;
  const bitmap = await createImageBitmap(ficheiro);
  const lado = 32;
  const tela = new OffscreenCanvas(lado, lado);
  const ctx = tela.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(bitmap, 0, 0, lado, lado);
  bitmap.close();
  const cantos = [
    [0, 0],
    [lado - 1, 0],
    [0, lado - 1],
    [lado - 1, lado - 1],
  ] as const;
  return cantos.every(([x, y]) => {
    const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(x, y, 1, 1).data;
    return a === 255 && r > 240 && g > 240 && b > 240;
  });
}
