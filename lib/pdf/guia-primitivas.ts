import { jsPDF } from "jspdf";
import { type Cor, DOURADO } from "./folha";

// Peças dos guias personalizados (D-181): o aspeto do guia de acesso em HTML (D-180), feito em
// jsPDF para se gerar no servidor. Capa escura, páginas brancas com cabeçalho e rodapé,
// cartões, passos numerados e notas com a barra dourada.

export const FUNDO: Cor = [0x09, 0x09, 0x0b];
export const OURO_TEXTO: Cor = [0xb8, 0x76, 0x0a];
const SEC: Cor = [0x52, 0x52, 0x5b];
const TER: Cor = [0x71, 0x71, 0x7a];
const BORDA: Cor = [0xe4, 0xe4, 0xe7];
const CREME: Cor = [0xff, 0xf8, 0xec];

export type Imagem = { dados: string; formato: "PNG" | "JPEG" | "WEBP" };

export function criarGuia(o: { marca: string; seccao: (n: number) => string }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const M = 18;
  const util = L - 2 * M;
  let y = 0;
  let pagina = 0;
  let tituloAtual = "";

  const fonte = (tamanho: number, peso: "normal" | "bold" = "normal", cor: Cor = FUNDO) =>
    doc
      .setFont("helvetica", peso)
      .setFontSize(tamanho)
      .setTextColor(...cor);
  const quebrar = (texto: string, largura: number) =>
    doc.splitTextToSize(texto, largura) as string[];

  // A página 1 é sempre a capa: cada página interior é uma página nova.
  const novaPagina = (titulo: string) => {
    doc.addPage();
    pagina += 1;
    tituloAtual = titulo;
    fonte(8, "bold", OURO_TEXTO).text(o.marca.toUpperCase(), M, 16);
    fonte(8, "bold", TER).text(o.seccao(pagina).toUpperCase(), L - M, 16, { align: "right" });
    y = 30;
    fonte(20, "bold");
    const linhas = quebrar(titulo, util);
    doc.text(linhas, M, y);
    y += linhas.length * 8 + 2;
  };
  /** Se o bloco não cabe, continua numa página nova com o mesmo título. */
  const espaco = (mm: number) => {
    if (y + mm > A - 26) {
      pagina -= 1;
      novaPagina(tituloAtual);
    }
  };
  const intro = (texto: string) => {
    fonte(11, "normal", SEC);
    const linhas = quebrar(texto, util);
    doc.text(linhas, M, y);
    y += linhas.length * 5.2 + 4;
  };
  const h3 = (texto: string) => {
    espaco(18);
    y += 2;
    fonte(12.5, "bold").text(texto, M, y);
    y += 6.5;
  };
  const paragrafo = (texto: string, cor: Cor = FUNDO) => {
    fonte(10.5, "normal", cor);
    const linhas = quebrar(texto, util);
    espaco(linhas.length * 5);
    fonte(10.5, "normal", cor);
    doc.text(linhas, M, y);
    y += linhas.length * 5 + 2;
  };
  const passos = (lista: string[]) => {
    lista.forEach((p, i) => {
      fonte(10.5);
      const linhas = quebrar(p, util - 10);
      espaco(linhas.length * 5 + 2);
      doc.setFillColor(...FUNDO).circle(M + 3.2, y - 1.3, 3.2, "F");
      fonte(8.5, "bold", DOURADO).text(String(i + 1), M + 3.2, y - 0.1, { align: "center" });
      fonte(10.5).text(linhas, M + 10, y);
      y += linhas.length * 5 + 2.6;
    });
    y += 1;
  };
  const lista = (itens: string[]) => {
    itens.forEach((item) => {
      fonte(10.5);
      const linhas = quebrar(item, util - 6);
      espaco(linhas.length * 5);
      fonte(10.5);
      doc.setFillColor(...DOURADO).circle(M + 1.3, y - 1.3, 1, "F");
      doc.text(linhas, M + 6, y);
      y += linhas.length * 5 + 1.6;
    });
    y += 1;
  };
  const nota = (texto: string) => {
    fonte(10);
    const linhas = quebrar(texto, util - 12);
    const h = linhas.length * 5 + 7;
    espaco(h + 2);
    doc.setFillColor(...CREME).roundedRect(M, y - 2, util, h, 2, 2, "F");
    doc.setFillColor(...DOURADO).rect(M, y - 2, 1.4, h, "F");
    fonte(10).text(linhas, M + 6, y + 3.4);
    y += h + 4;
  };
  /** Dois cartões por linha: rótulo, título, endereço e texto. */
  const cartoes = (lista: { rotulo: string; titulo: string; url: string; texto: string }[]) => {
    const g = 5;
    const w = (util - g) / 2;
    for (let i = 0; i < lista.length; i += 2) {
      const par = lista.slice(i, i + 2);
      const alturas = par.map((c) => {
        fonte(10, "bold");
        const url = quebrar(c.url, w - 10).length;
        fonte(9.5);
        return 22 + url * 4.6 + quebrar(c.texto, w - 10).length * 4.6;
      });
      const h = Math.max(...alturas);
      espaco(h);
      par.forEach((c, j) => {
        const x = M + j * (w + g);
        const destaque = i === 0 && j === 0;
        doc.setFillColor(...(destaque ? CREME : ([255, 255, 255] as Cor)));
        doc.setDrawColor(...(destaque ? DOURADO : BORDA)).setLineWidth(0.3);
        doc.roundedRect(x, y, w, h, 3, 3, "FD");
        let yy = y + 7;
        fonte(7.5, "bold", TER).text(c.rotulo.toUpperCase(), x + 5, yy);
        yy += 6;
        fonte(12, "bold").text(c.titulo, x + 5, yy);
        yy += 6;
        fonte(10, "bold", OURO_TEXTO);
        const url = quebrar(c.url, w - 10);
        doc.text(url, x + 5, yy);
        yy += url.length * 4.6 + 1.5;
        fonte(9.5, "normal", SEC).text(quebrar(c.texto, w - 10), x + 5, yy);
      });
      y += h + g;
    }
    y += 1;
  };
  const tabela = (linhas: [string, string][]) => {
    linhas.forEach(([a, b]) => {
      fonte(10);
      const textoB = quebrar(b, util - 52);
      espaco(textoB.length * 4.8 + 3);
      fonte(10, "bold").text(a, M, y);
      fonte(10, "normal", SEC).text(textoB, M + 52, y);
      y += textoB.length * 4.8 + 2;
      doc
        .setDrawColor(...BORDA)
        .setLineWidth(0.2)
        .line(M, y - 3, L - M, y - 3);
      y += 1.2;
    });
    y += 2;
  };
  const fechar = (rodape: string) => {
    const total = doc.getNumberOfPages();
    for (let n = 2; n <= total; n++) {
      doc.setPage(n);
      doc
        .setDrawColor(...BORDA)
        .setLineWidth(0.2)
        .line(M, A - 16, L - M, A - 16);
      fonte(8, "normal", TER).text(rodape, M, A - 10);
      doc.text(String(n), L - M, A - 10, { align: "right" });
    }
    return doc;
  };

  // prettier-ignore
  return {
    doc, L, A, M, fonte, quebrar, novaPagina, espaco, intro, h3, paragrafo, passos, lista, nota,
    cartoes, tabela, fechar,
    get y() {
      return y;
    },
    set y(v: number) {
      y = v;
    },
  };
}

export type Guia = ReturnType<typeof criarGuia>;
