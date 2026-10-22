// Grelha do código QR (ISO/IEC 18004): padrões fixos, informação de formato e de versão, e a
// colocação dos dados em ziguezague. Usada por qr.ts.

const ALINHAMENTO = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

/** Resto BCH de `valor` deslocado pelo grau do gerador (formato e versão). */
export function bch(valor: number, gerador: number, grau: number): number {
  let r = valor << grau;
  for (let i = 31 - Math.clz32(r); i >= grau; i--) if ((r >>> i) & 1) r ^= gerador << (i - grau);
  return r;
}

export type Grelha = { m: boolean[][]; funcao: boolean[][] };

export function grelhaBase(v: number): Grelha {
  const n = 17 + 4 * v;
  const m = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const funcao = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const poe = (x: number, y: number, escuro: boolean) => {
    m[y]![x] = escuro;
    funcao[y]![x] = true;
  };
  for (let i = 0; i < n; i++) {
    poe(6, i, i % 2 === 0);
    poe(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [
    [3, 3],
    [n - 4, 3],
    [3, n - 4],
  ] as const)
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < n && y >= 0 && y < n) poe(x, y, d !== 2 && d !== 4);
      }
  const pos = ALINHAMENTO[v - 1]!;
  for (const ax of pos)
    for (const ay of pos) {
      if ((ax === 6 && ay === 6) || (ax === 6 && ay === n - 7) || (ax === n - 7 && ay === 6))
        continue;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++)
          poe(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  formato(m, funcao, 0);
  if (v >= 7) {
    const bits = (v << 12) | bch(v, 0x1f25, 12);
    for (let i = 0; i < 18; i++) {
      const escuro = ((bits >>> i) & 1) === 1;
      const a = n - 11 + (i % 3);
      const b = Math.floor(i / 3);
      poe(a, b, escuro);
      poe(b, a, escuro);
    }
  }
  return { m, funcao };
}

/** As duas cópias da informação de formato (correção M = 00) e o módulo escuro fixo. */
export function formato(m: boolean[][], funcao: boolean[][], mascara: number) {
  const n = m.length;
  const bits = ((mascara << 10) | bch(mascara, 0x537, 10)) ^ 0x5412;
  const poe = (x: number, y: number, i: number) => {
    m[y]![x] = ((bits >>> i) & 1) === 1;
    funcao[y]![x] = true;
  };
  for (let i = 0; i <= 5; i++) poe(8, i, i);
  poe(8, 7, 6);
  poe(8, 8, 7);
  poe(7, 8, 8);
  for (let i = 9; i < 15; i++) poe(14 - i, 8, i);
  for (let i = 0; i < 8; i++) poe(n - 1 - i, 8, i);
  for (let i = 8; i < 15; i++) poe(8, n - 15 + i, i);
  m[n - 8]![8] = true;
  funcao[n - 8]![8] = true;
}

export function colocarDados(g: Grelha, dados: number[], restoBits: number) {
  const n = g.m.length;
  const total = dados.length * 8 + restoBits;
  let i = 0;
  for (let direita = n - 1; direita >= 1; direita -= 2) {
    if (direita === 6) direita = 5;
    for (let vert = 0; vert < n; vert++)
      for (let j = 0; j < 2; j++) {
        const x = direita - j;
        const y = ((direita + 1) & 2) === 0 ? n - 1 - vert : vert;
        if (g.funcao[y]![x] || i >= total) continue;
        g.m[y]![x] = i < dados.length * 8 && ((dados[i >>> 3]! >>> (7 - (i & 7))) & 1) === 1;
        i++;
      }
  }
}
