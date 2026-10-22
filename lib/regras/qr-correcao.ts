// Correção de erros Reed-Solomon do código QR, em GF(256) com o polinómio 0x11D (ISO/IEC 18004).

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]!;

const multiplicar = (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a]! + LOG[b]!]!);

/** Polinómio gerador de grau n, com as raízes α^0 … α^(n−1); coeficientes do maior para o menor. */
function gerador(n: number): number[] {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const seguinte = new Array<number>(g.length + 1).fill(0);
    g.forEach((c, j) => {
      seguinte[j] = seguinte[j]! ^ c;
      seguinte[j + 1] = seguinte[j + 1]! ^ multiplicar(c, EXP[i]!);
    });
    g = seguinte;
  }
  return g;
}

/** Os n bytes de correção de um bloco de dados: o resto da divisão pelo gerador. */
export function bytesCorrecao(dados: number[], n: number): number[] {
  const g = gerador(n);
  const resto = new Array<number>(n).fill(0);
  for (const b of dados) {
    const fator = b ^ resto.shift()!;
    resto.push(0);
    for (let i = 0; i < n; i++) resto[i] = resto[i]! ^ multiplicar(g[i + 1]!, fator);
  }
  return resto;
}
