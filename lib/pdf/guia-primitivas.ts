import {
  AMARELO_CLARO as CREME,
  CINZA as TER,
  CINZA_ESCURO as SEC,
  type Cor,
  criarDocumento,
  desenharLogo,
  DOURADO,
  FUNDO,
  REALCE,
  OURO_TEXTO,
  LETRA,
} from "./estilo";

import { LOGO_PRETO } from "./logos-marca";

export { FUNDO, OURO_TEXTO } from "./estilo";

// Peças dos guias personalizados (D-181): o aspeto do guia de acesso em HTML (D-180), feito em
// jsPDF para se gerar no servidor. Capa escura, páginas brancas com cabeçalho e rodapé,
// cartões, passos numerados e notas com a barra dourada. Cores do estilo comum (D-184).

export type Imagem = { dados: string; formato: "PNG" | "JPEG" | "WEBP" };

export function criarGuia(o: { marca: string; seccao: (n: number) => string }) {
  const doc = criarDocumento();
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const M = 18;
  const util = L - 2 * M;
  let y = 0;
  let pagina = 0;
  let tituloAtual = "";
  /** Largura do texto: a página toda, ou a coluna ao lado de uma imagem (`aoLado`). */
  let largura = util;

  const fonte = (tamanho: number, peso: "normal" | "bold" = "normal", cor: Cor = FUNDO) =>
    doc
      .setFont(LETRA, peso)
      .setFontSize(tamanho)
      .setTextColor(...cor);
  const quebrar = (texto: string, largura: number) =>
    doc.splitTextToSize(texto, largura) as string[];

  // A página 1 é sempre a capa: cada página interior é uma página nova.
  const novaPagina = (titulo: string) => {
    doc.addPage();
    pagina += 1;
    tituloAtual = titulo;
    desenharLogo(doc, LOGO_PRETO, M, 11, 7);
    fonte(9, "normal", TER).text(`${o.marca} · ${o.seccao(pagina)}`, L - M, 16, {
      align: "right",
    });
    y = 42;
    fonte(26, "bold");
    const linhas = quebrar(titulo, util);
    doc.text(linhas, M, y);
    doc.setFillColor(...DOURADO).rect(M, y + linhas.length * 10 - 6.5, 14, 1.2, "F");
    y += linhas.length * 10 + 5;
  };
  /** Se o bloco não cabe, continua numa página nova com o mesmo título. */
  const espaco = (mm: number) => {
    if (y + mm > A - 26) {
      pagina -= 1;
      novaPagina(tituloAtual);
    }
  };
  const intro = (texto: string) => {
    fonte(12, "normal", SEC);
    const linhas = quebrar(texto, largura);
    doc.text(linhas, M, y);
    y += linhas.length * 5.9 + 5;
  };
  const h3 = (texto: string) => {
    espaco(20);
    y += 4;
    fonte(14, "bold").text(texto, M, y);
    y += 7.5;
  };
  const paragrafo = (texto: string, cor: Cor = FUNDO) => {
    fonte(11, "normal", cor);
    const linhas = quebrar(texto, largura);
    espaco(linhas.length * 5.4);
    fonte(11, "normal", cor);
    doc.text(linhas, M, y);
    y += linhas.length * 5.4 + 2.5;
  };
  const passos = (lista: string[]) => {
    lista.forEach((p, i) => {
      fonte(11);
      const linhas = quebrar(p, largura - 11);
      espaco(linhas.length * 5.4 + 3);
      doc.setFillColor(...FUNDO).circle(M + 3.5, y - 1.4, 3.5, "F");
      fonte(9, "bold", DOURADO).text(String(i + 1), M + 3.5, y - 0.1, { align: "center" });
      fonte(11).text(linhas, M + 11, y);
      y += linhas.length * 5.4 + 3.4;
    });
    y += 1;
  };
  const lista = (itens: string[]) => {
    itens.forEach((item) => {
      fonte(11);
      const linhas = quebrar(item, largura - 6);
      espaco(linhas.length * 5.4);
      fonte(11);
      doc.setFillColor(...DOURADO).rect(M, y - 2.6, 2, 2, "F");
      doc.text(linhas, M + 6, y);
      y += linhas.length * 5.4 + 2.2;
    });
    y += 1;
  };
  const nota = (texto: string) => {
    fonte(11);
    const linhas = quebrar(texto, util - 16);
    const h = linhas.length * 5.4 + 10;
    espaco(h + 4);
    y += 2;
    doc.setFillColor(...CREME).rect(M, y - 2, util, h, "F");
    doc.setFillColor(...DOURADO).rect(M, y - 2, 2, h, "F");
    fonte(11).text(linhas, M + 8, y + 5);
    y += h + 5;
  };
  /** Dois cartões por linha: rótulo, título, endereço e texto. */
  const cartoes = (lista: { rotulo: string; titulo: string; url: string; texto: string }[]) => {
    const g = 5;
    // Um cartão sozinho ocupa a largura toda.
    const w = lista.length === 1 ? util : (util - g) / 2;
    for (let i = 0; i < lista.length; i += 2) {
      const par = lista.slice(i, i + 2);
      const alturas = par.map((c) => {
        fonte(10.5, "bold");
        const url = quebrar(c.url, w - 12).length;
        fonte(10);
        return 27 + url * 5 + quebrar(c.texto, w - 12).length * 5;
      });
      const h = Math.max(...alturas);
      espaco(h);
      par.forEach((c, j) => {
        const x = M + j * (w + g);
        const destaque = i === 0 && j === 0;
        // Campos de cor lisa, sem contorno: o acesso de quem lê em dourado, os outros em cinza.
        doc.setFillColor(...(destaque ? DOURADO : REALCE)).rect(x, y, w, h, "F");
        let yy = y + 8;
        fonte(9, "bold", destaque ? FUNDO : TER).text(c.rotulo, x + 6, yy);
        yy += 7;
        fonte(13.5, "bold").text(c.titulo, x + 6, yy);
        yy += 6.5;
        fonte(10.5, "bold", destaque ? FUNDO : OURO_TEXTO);
        const url = quebrar(c.url, w - 12);
        doc.text(url, x + 6, yy);
        yy += url.length * 5 + 2;
        fonte(10, "normal", destaque ? FUNDO : SEC).text(quebrar(c.texto, w - 12), x + 6, yy);
      });
      y += h + g;
    }
    y += 1;
  };
  const tabela = (linhas: [string, string][]) => {
    // Linhas alternadas em cor lisa, sem riscas finas.
    linhas.forEach(([a, b], i) => {
      fonte(10.5);
      const textoB = quebrar(b, util - 58);
      const h = textoB.length * 5 + 4.4;
      espaco(h + 1);
      if (i % 2 === 0) doc.setFillColor(...REALCE).rect(M, y - 4.6, util, h, "F");
      fonte(10.5, "bold").text(a, M + 4, y);
      fonte(10.5, "normal", SEC).text(textoB, M + 54, y);
      y += h;
    });
    y += 4;
  };
  /**
   * Uma imagem real da aplicação à direita, com o texto do bloco na coluna ao lado. Se não couber,
   * passa para a página seguinte inteira.
   */
  const aoLado = (
    img: { proporcao: number; dados: string },
    larguraImg: number,
    bloco: () => void,
  ) => {
    const h = larguraImg / img.proporcao;
    espaco(Math.min(h, 120) + 4);
    const topo = y - 5;
    doc.addImage(img.dados, "JPEG", L - M - larguraImg, topo, larguraImg, h, undefined, "FAST");
    largura = util - larguraImg - 9;
    bloco();
    largura = util;
    y = Math.max(y, topo + h + 8);
  };
  const fechar = (rodape: string) => {
    const total = doc.getNumberOfPages();
    for (let n = 2; n <= total; n++) {
      doc.setPage(n);
      fonte(8.5, "normal", TER).text(rodape, M, A - 10);
      doc.text(String(n), L - M, A - 10, { align: "right" });
    }
    return doc;
  };

  // prettier-ignore
  return {
    doc, L, A, M, fonte, quebrar, novaPagina, espaco, intro, h3, paragrafo, passos, lista, nota,
    cartoes, tabela, aoLado, fechar,
    get y() {
      return y;
    },
    set y(v: number) {
      y = v;
    },
  };
}

export type Guia = ReturnType<typeof criarGuia>;
