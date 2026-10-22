import { bytesCorrecao } from "./qr-correcao";
import { colocarDados, formato, grelhaBase } from "./qr-grelha";

// Código QR (F.4.3) para a fila presencial: modo byte, correção M, versões 1 a 10 (até 213 bytes,
// o bastante para um endereço). Escrito à mão para não acrescentar uma dependência (D-126).

/** Por versão: bytes de correção por bloco e os grupos [blocos, bytes de dados por bloco]. */
const VERSOES: [number, [number, number][]][] = [
  [10, [[1, 16]]],
  [16, [[1, 28]]],
  [26, [[1, 44]]],
  [18, [[2, 32]]],
  [24, [[2, 43]]],
  [16, [[4, 27]]],
  [18, [[4, 31]]],
  [
    22,
    [
      [2, 38],
      [2, 39],
    ],
  ],
  [
    22,
    [
      [3, 36],
      [2, 37],
    ],
  ],
  [
    26,
    [
      [4, 43],
      [1, 44],
    ],
  ],
];
const RESTO_BITS = [0, 7, 7, 7, 7, 7, 0, 0, 0, 0];

const MASCARAS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

const dadosDaVersao = (v: number) => VERSOES[v - 1]![1].reduce((s, [n, d]) => s + n * d, 0);

/** Os bytes de dados e de correção, já intercalados por bloco. */
function codewords(texto: string, v: number): number[] {
  const bytes = [...new TextEncoder().encode(texto)];
  const bits: number[] = [];
  const poe = (valor: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((valor >>> i) & 1);
  };
  poe(0b0100, 4);
  poe(bytes.length, v < 10 ? 8 : 16);
  bytes.forEach((b) => poe(b, 8));
  const capacidade = dadosDaVersao(v) * 8;
  poe(0, Math.min(4, capacidade - bits.length));
  while (bits.length % 8) bits.push(0);
  const dados: number[] = [];
  for (let i = 0; i < bits.length; i += 8) dados.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let p = 0; dados.length < capacidade / 8; p++) dados.push(p % 2 ? 0x11 : 0xec);

  const [nCorrecao, grupos] = VERSOES[v - 1]!;
  const blocos: number[][] = [];
  let k = 0;
  for (const [n, d] of grupos) for (let i = 0; i < n; i++) blocos.push(dados.slice(k, (k += d)));
  const correcao = blocos.map((b) => bytesCorrecao(b, nCorrecao));
  const saida: number[] = [];
  const maior = Math.max(...blocos.map((b) => b.length));
  for (let i = 0; i < maior; i++) blocos.forEach((b) => i < b.length && saida.push(b[i]!));
  for (let i = 0; i < nCorrecao; i++) correcao.forEach((c) => saida.push(c[i]!));
  return saida;
}

/** Penalização da norma para escolher a máscara (sequências, blocos, padrões falsos, equilíbrio). */
function penalizacao(m: boolean[][]): number {
  const n = m.length;
  let p = 0;
  const linhas = [...m.map((l) => l), ...m.map((_, x) => m.map((l) => l[x]!))];
  for (const l of linhas) {
    let corrida = 1;
    for (let i = 1; i <= n; i++) {
      if (i < n && l[i] === l[i - 1]) corrida++;
      else {
        if (corrida >= 5) p += corrida - 2;
        corrida = 1;
      }
    }
    const s = l.map((b) => (b ? "1" : "0")).join("");
    p +=
      40 *
      ((s.match(/(?=10111010000)/g)?.length ?? 0) + (s.match(/(?=00001011101)/g)?.length ?? 0));
  }
  let escuros = 0;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (m[y]![x]) escuros++;
      if (x < n - 1 && y < n - 1) {
        const c = m[y]![x];
        if (c === m[y]![x + 1] && c === m[y + 1]![x] && c === m[y + 1]![x + 1]) p += 3;
      }
    }
  return p + 10 * Math.floor(Math.abs(escuros * 20 - n * n * 10) / (n * n));
}

/** A matriz do código QR (verdadeiro = módulo escuro), sem a margem; nulo se o texto não couber. */
export function codigoQr(texto: string): boolean[][] | null {
  const bytes = new TextEncoder().encode(texto).length;
  const v = VERSOES.findIndex((_, i) => (i < 9 ? 2 : 3) + bytes <= dadosDaVersao(i + 1)) + 1;
  if (v === 0) return null;
  const dados = codewords(texto, v);
  let melhor: boolean[][] | null = null;
  let menor = Infinity;
  MASCARAS.forEach((mascara, k) => {
    const g = grelhaBase(v);
    colocarDados(g, dados, RESTO_BITS[v - 1]!);
    for (let y = 0; y < g.m.length; y++)
      for (let x = 0; x < g.m.length; x++)
        if (!g.funcao[y]![x] && mascara(x, y)) g.m[y]![x] = !g.m[y]![x];
    formato(g.m, g.funcao, k);
    const p = penalizacao(g.m);
    if (p < menor) {
      menor = p;
      melhor = g.m;
    }
  });
  return melhor;
}
