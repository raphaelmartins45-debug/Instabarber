import {
  AMARELO_CLARO,
  CINZA,
  CINZA_ESCURO,
  type Cor,
  DOURADO,
  LINHA,
  LINHA_FORTE,
  rotuloEspacado,
  TINTA,
} from "./estilo";
import type { FolhaBase } from "./folha";

// Os blocos da folha dos documentos de gestão (D-184): listas, passos, notas, tabelas e barras.

/** Lista com marcadores dourados; com duas colunas para listas curtas e longas. */
export function desenharLista(f: FolhaBase, itens: string[], colunas: 1 | 2) {
  const w = colunas === 2 ? (f.util - 6) / 2 : f.util;
  const linhasDe = (item: string) => {
    f.fonte(10);
    return f.quebrar(item, w - 5);
  };
  for (let i = 0; i < itens.length; i += colunas) {
    const par = itens.slice(i, i + colunas).map(linhasDe);
    const h = Math.max(...par.map((l) => l.length)) * 4.8 + 1.8;
    f.espaco(h);
    par.forEach((linhas, j) => {
      const x = f.M + j * (w + 6);
      f.doc.setFillColor(...DOURADO).circle(x + 1, f.y - 1.3, 0.85, "F");
      f.fonte(10).text(linhas, x + 5, f.y);
    });
    f.y += h;
  }
  f.y += 1;
}

/** Passos numerados: círculo escuro com o número a dourado. */
export function desenharPassos(f: FolhaBase, itens: string[]) {
  itens.forEach((p, i) => {
    f.fonte(10);
    const linhas = f.quebrar(p, f.util - 10);
    f.espaco(linhas.length * 4.8 + 3);
    f.doc.setFillColor(...TINTA).circle(f.M + 3, f.y - 1.3, 3, "F");
    f.fonte(8, "bold", DOURADO).text(String(i + 1), f.M + 3, f.y - 0.1, { align: "center" });
    f.fonte(10).text(linhas, f.M + 9.5, f.y);
    f.y += linhas.length * 4.8 + 2.8;
  });
  f.y += 1;
}

/** Nota em destaque: fundo amarelo claro e barra dourada (Parte I). */
export function desenharNota(f: FolhaBase, texto: string) {
  f.fonte(10);
  const linhas = f.quebrar(texto, f.util - 12);
  const h = linhas.length * 4.8 + 7;
  f.espaco(h + 3);
  f.y += 1;
  f.doc.setFillColor(...AMARELO_CLARO).rect(f.M, f.y - 2, f.util, h, "F");
  f.doc.setFillColor(...DOURADO).rect(f.M, f.y - 2, 1.2, h, "F");
  f.fonte(10).text(linhas, f.M + 6, f.y + 3.4);
  f.y += h + 3;
}

/** Valores que se alinham à direita nas tabelas: dinheiro, números e percentagens. */
const NUMERICO = /^[−-]?[\d\s.,]+(\s?(€|%))?$/;

export type Barra = { rotulo: string; valor: number; destaque: boolean };

/** Tabela: cabeçalho pequeno, linhas com separador fino e números alinhados à direita. */
export function desenharTabela(f: FolhaBase, colunas: string[], linhas: string[][]) {
  const { doc, M, L, util, fonte, quebrar } = f;
  const pesos = colunas.map((_, i) => (i === 0 && colunas.length > 2 ? 1.7 : 1));
  const soma = pesos.reduce((s, p) => s + p, 0);
  const larguras = pesos.map((p) => (p / soma) * util);
  const xs = larguras.map((_, i) => M + larguras.slice(0, i).reduce((s, w) => s + w, 0));
  const direita = colunas.map(
    (_, i) => i > 0 && linhas.length > 0 && linhas.every((l) => NUMERICO.test(l[i] ?? "")),
  );
  const fila = (valores: string[], cabecalho: boolean) => {
    if (cabecalho) fonte(7.5, "bold", CINZA);
    else fonte(9.5);
    const partes = valores.map((v, i) =>
      quebrar(cabecalho ? v.toUpperCase() : v, larguras[i]! - 3),
    );
    const h = Math.max(1, ...partes.map((p) => p.length)) * (cabecalho ? 3.6 : 4.4) + 3;
    f.espaco(h + 1);
    partes.forEach((p, i) => {
      if (direita[i]) doc.text(p, xs[i]! + larguras[i]!, f.y, { align: "right" });
      else doc.text(p, xs[i]!, f.y);
    });
    f.y += h - 3;
    doc
      .setDrawColor(...(cabecalho ? LINHA_FORTE : LINHA))
      .setLineWidth(cabecalho ? 0.3 : 0.2)
      .line(M, f.y - 1, L - M, f.y - 1);
    f.y += 4.2;
  };
  fila(colunas, true);
  linhas.forEach((l) => fila(l, false));
  f.y += 1;
}

/** Barras da evolução: a do mês em destaque na cor do documento, as outras em cinzento. */
export function desenharBarras(f: FolhaBase, cor: Cor, valores: Barra[]) {
  const { doc, M, L, util, fonte } = f;
  const alturaMax = 30;
  f.espaco(alturaMax + 12);
  const y = f.y;
  const maximo = Math.max(1, ...valores.map((v) => v.valor));
  const passo = util / valores.length;
  doc
    .setDrawColor(...LINHA_FORTE)
    .setLineWidth(0.2)
    .line(M, y + alturaMax, L - M, y + alturaMax);
  valores.forEach((v, i) => {
    const h = (v.valor / maximo) * alturaMax;
    const x = M + i * passo + passo * 0.22;
    doc
      .setFillColor(...(v.destaque ? cor : LINHA_FORTE))
      .rect(x, y + alturaMax - h, passo * 0.56, h, "F");
    fonte(8, v.destaque ? "bold" : "normal", v.destaque ? TINTA : CINZA).text(
      v.rotulo,
      x + passo * 0.28,
      y + alturaMax + 5,
      { align: "center" },
    );
  });
  f.y = y + alturaMax + 10;
}

/** Rótulo pequeno por cima do título do documento. */
export function desenharSobretitulo(f: FolhaBase, texto: string) {
  f.fonte(8, "bold", CINZA);
  rotuloEspacado(f.doc, texto, f.M, f.y);
  f.y += 7;
}

/** Linha de apoio por baixo do título («Preparada para…»). */
export function desenharLead(f: FolhaBase, texto: string) {
  f.fonte(11, "normal", CINZA_ESCURO);
  const linhas = f.quebrar(texto, f.util);
  f.doc.text(linhas, f.M, f.y);
  f.y += linhas.length * 5.4 + 3;
}

/** Dados de capa em colunas: rótulo pequeno e valor (número, data, validade). */
export function desenharMeta(f: FolhaBase, pares: [string, string][]) {
  const { doc, M, L, util, fonte, quebrar } = f;
  f.espaco(16);
  f.y += 3;
  doc
    .setDrawColor(...LINHA)
    .setLineWidth(0.25)
    .line(M, f.y - 5, L - M, f.y - 5);
  const w = util / pares.length;
  pares.forEach(([rotulo, valor], i) => {
    const x = M + i * w;
    fonte(7.5, "bold", CINZA);
    rotuloEspacado(doc, rotulo, x, f.y, "left", 0.3);
    fonte(10.5, "bold").text(quebrar(valor, w - 4), x, f.y + 5.5);
  });
  f.y += 12;
  doc.line(M, f.y - 3, L - M, f.y - 3);
  f.y += 4;
}

/** O valor principal numa faixa escura, grande, com notas à direita (D-184). */
export function desenharDestaque(
  f: FolhaBase,
  rotulo: string,
  valor: string,
  notas: [string, string][],
) {
  const { doc, M, util, fonte } = f;
  const h = 34;
  f.espaco(h + 6);
  doc.setFillColor(...TINTA).rect(M, f.y, util, h, "F");
  doc.setFillColor(...DOURADO).rect(M, f.y, 2, h, "F");
  fonte(10, "bold", [0xa1, 0xa1, 0xaa]).text(rotulo, M + 9, f.y + 11);
  fonte(30, "bold", DOURADO).text(valor, M + 9, f.y + 25);
  notas.forEach(([r, v], i) => {
    const x = M + util * 0.55 + i * (util * 0.22);
    fonte(9, "normal", [0xa1, 0xa1, 0xaa]).text(r, x, f.y + 13);
    fonte(13, "bold", [0xf4, 0xf4, 0xf5]).text(v, x, f.y + 21);
  });
  f.y += h + 8;
}

/** Dados em grelha de campos lisos (sem riscas): rótulo pequeno e valor (D-184). */
export function desenharGrelha(f: FolhaBase, pares: [string, string][], colunas = 3) {
  const { doc, M, util, fonte } = f;
  const g = 3;
  const w = (util - g * (colunas - 1)) / colunas;
  const h = 17;
  for (let i = 0; i < pares.length; i += colunas) {
    f.espaco(h + g);
    pares.slice(i, i + colunas).forEach(([r, v], j) => {
      const x = M + j * (w + g);
      doc.setFillColor(0xf4, 0xf4, 0xf5).rect(x, f.y, w, h, "F");
      fonte(9, "normal", CINZA_ESCURO).text(r, x + 5, f.y + 6.5);
      fonte(12.5, "bold").text(v, x + 5, f.y + 13);
    });
    f.y += h + g;
  }
  f.y += 4;
}
