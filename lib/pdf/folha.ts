import { jsPDF } from "jspdf";

// Folha A4 dos documentos de gestão: cabeçalho escuro, barra na cor da barbearia, títulos de
// secção, linhas rótulo-valor e paginação com o rodapé em todas as páginas.

export type Cor = [number, number, number];
export const PRETO: Cor = [0x12, 0x10, 0x0e];
export const DOURADO: Cor = [0xf5, 0xa6, 0x23];
export const CINZA: Cor = [0x8a, 0x84, 0x7c];

export function corDeHex(hex: string): Cor {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return PRETO;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function criarFolha(o: { marca: string; titulo: string; cor: Cor }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 18;
  let y = 0;

  const cabecalho = () => {
    doc.setFillColor(...PRETO).rect(0, 0, largura, 22, "F");
    doc.setFillColor(...o.cor).rect(0, 22, largura, 2.5, "F");
    doc
      .setTextColor(...DOURADO)
      .setFont("helvetica", "bold")
      .setFontSize(14)
      .text(o.marca, margem, 14);
    doc
      .setTextColor(255, 255, 255)
      .setFont("helvetica", "normal")
      .setFontSize(10)
      .text(o.titulo, largura - margem, 14, { align: "right" });
    y = 34;
  };
  const espaco = (mm: number) => {
    if (y + mm > altura - 24) {
      doc.addPage();
      cabecalho();
    }
  };
  const titulo = (texto: string) => {
    espaco(14);
    y += 2;
    doc
      .setTextColor(0xc9, 0x82, 0x1a)
      .setFont("helvetica", "bold")
      .setFontSize(11)
      .text(texto, margem, y);
    y += 6;
  };
  const linha = (rotulo: string, valor: string, forte = false) => {
    espaco(6);
    doc
      .setTextColor(...CINZA)
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .text(rotulo, margem, y);
    doc
      .setTextColor(...PRETO)
      .setFont("helvetica", forte ? "bold" : "normal")
      .setFontSize(10)
      .text(valor, largura - margem, y, { align: "right" });
    y += 5.5;
  };
  const paragrafo = (texto: string) => {
    const linhas = doc
      .setFont("helvetica", "normal")
      .setFontSize(10)
      .splitTextToSize(texto, largura - 2 * margem);
    espaco(linhas.length * 5);
    doc.setTextColor(...PRETO).text(linhas, margem, y);
    y += linhas.length * 5 + 1;
  };
  const tabela = (colunas: string[], linhas: string[][]) => {
    const largCol = (largura - 2 * margem) / colunas.length;
    const fila = (valores: string[], cor: Cor, negrito: boolean) => {
      espaco(6);
      doc
        .setTextColor(...cor)
        .setFont("helvetica", negrito ? "bold" : "normal")
        .setFontSize(9);
      valores.forEach((v, i) =>
        i === 0
          ? doc.text(v, margem, y)
          : doc.text(v, margem + largCol * (i + 1), y, { align: "right" }),
      );
      y += 5.5;
    };
    fila(colunas, CINZA, true);
    linhas.forEach((l) => fila(l, PRETO, false));
  };
  const barras = (valores: { rotulo: string; valor: number; destaque: boolean }[]) => {
    const alturaMax = 30;
    espaco(alturaMax + 10);
    const maximo = Math.max(1, ...valores.map((v) => v.valor));
    const passo = (largura - 2 * margem) / valores.length;
    valores.forEach((v, i) => {
      const h = (v.valor / maximo) * alturaMax;
      const x = margem + i * passo + passo * 0.2;
      doc
        .setFillColor(...(v.destaque ? DOURADO : CINZA))
        .rect(x, y + alturaMax - h, passo * 0.6, h, "F");
      doc
        .setTextColor(...CINZA)
        .setFontSize(8)
        .text(v.rotulo, x + passo * 0.3, y + alturaMax + 5, { align: "center" });
    });
    y += alturaMax + 9;
  };
  const fechar = (rodape: string, pagina: (n: number, total: number) => string) => {
    const total = doc.getNumberOfPages();
    for (let n = 1; n <= total; n++) {
      doc.setPage(n);
      doc.setDrawColor(...DOURADO).line(margem, altura - 18, largura - margem, altura - 18);
      doc
        .setTextColor(...CINZA)
        .setFont("helvetica", "normal")
        .setFontSize(8);
      doc.text(rodape, margem, altura - 12);
      doc.text(pagina(n, total), largura - margem, altura - 12, { align: "right" });
    }
    return doc;
  };
  const subtitulo = (texto: string) => {
    doc
      .setTextColor(...PRETO)
      .setFont("helvetica", "bold")
      .setFontSize(16)
      .text(texto, margem, y);
    y += 8;
  };

  cabecalho();
  return { doc, titulo, subtitulo, linha, paragrafo, tabela, barras, fechar };
}
