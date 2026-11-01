import type { Assinatura } from "@/lib/documentos/assinatura";
import {
  ALTURA_ASSINATURA,
  CINZA,
  CINZA_ESCURO,
  type Cor,
  criarDocumento,
  desenharAssinatura,
  LINHA,
  REALCE,
  rotuloEspacado,
  TINTA,
} from "./estilo";
import {
  type Barra,
  desenharBarras,
  desenharLista,
  desenharNota,
  desenharPassos,
  desenharTabela,
} from "./folha-blocos";

export { type Cor, corDeHex, DOURADO } from "./estilo";

// Folha A4 dos documentos de gestão (D-184): papel timbrado discreto (filete de cor, marca e tipo
// de documento), títulos a preto, linhas de valores, total, assinatura e rodapé paginado. Listas,
// passos, notas, tabelas e barras em folha-blocos.ts. O dourado só em marcadores e filetes.

const M = 20;

export function criarFolha(o: { marca: string; titulo: string; cor: Cor }) {
  const doc = criarDocumento();
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const util = L - 2 * M;
  let y = 0;

  const fonte = (tamanho: number, peso: "normal" | "bold" = "normal", cor: Cor = TINTA) =>
    doc
      .setFont("helvetica", peso)
      .setFontSize(tamanho)
      .setTextColor(...cor);
  const quebrar = (texto: string, largura: number) =>
    doc.splitTextToSize(texto, largura) as string[];

  const cabecalho = () => {
    doc.setFillColor(...o.cor).rect(0, 0, L, 1.6, "F");
    fonte(12, "bold").text(o.marca, M, 15);
    fonte(7.5, "bold", CINZA);
    rotuloEspacado(doc, o.titulo, L - M, 15, "right");
    doc
      .setDrawColor(...LINHA)
      .setLineWidth(0.25)
      .line(M, 20, L - M, 20);
    y = 32;
  };
  const novaPagina = () => {
    doc.addPage();
    cabecalho();
  };
  /** Se o bloco não cabe, continua na página seguinte. */
  const espaco = (mm: number) => {
    if (y + mm > A - 24) novaPagina();
  };

  /** Rótulo pequeno por cima do título do documento. */
  const sobretitulo = (texto: string) => {
    fonte(8, "bold", CINZA);
    rotuloEspacado(doc, texto, M, y);
    y += 7;
  };
  /** O título do documento (primeira página). */
  const subtitulo = (texto: string) => {
    fonte(20, "bold");
    const linhas = quebrar(texto, util);
    espaco(linhas.length * 8 + 4);
    doc.text(linhas, M, y);
    y += linhas.length * 8 + 2;
  };
  /** Linha de apoio por baixo do título («Preparada para…»). */
  const lead = (texto: string) => {
    fonte(11, "normal", CINZA_ESCURO);
    const linhas = quebrar(texto, util);
    doc.text(linhas, M, y);
    y += linhas.length * 5.4 + 3;
  };
  /** Dados de capa em colunas: rótulo pequeno e valor (número, data, validade). */
  const meta = (pares: [string, string][]) => {
    espaco(16);
    y += 3;
    doc
      .setDrawColor(...LINHA)
      .setLineWidth(0.25)
      .line(M, y - 5, L - M, y - 5);
    const w = util / pares.length;
    pares.forEach(([rotulo, valor], i) => {
      const x = M + i * w;
      fonte(7.5, "bold", CINZA);
      rotuloEspacado(doc, rotulo, x, y, "left", 0.3);
      fonte(10.5, "bold").text(quebrar(valor, w - 4), x, y + 5.5);
    });
    y += 12;
    doc.line(M, y - 3, L - M, y - 3);
    y += 4;
  };
  /** Título de secção; `manter` é o espaço que o conteúdo a seguir precisa na mesma página. */
  const titulo = (texto: string, manter = 18) => {
    espaco(manter);
    y += 5;
    fonte(12.5, "bold").text(texto, M, y);
    y += 6.5;
  };
  const subtituloSeccao = (texto: string) => {
    espaco(12);
    y += 1.5;
    fonte(10.5, "bold").text(texto, M, y);
    y += 5;
  };
  /** Linha rótulo-valor com separador fino; o valor parte-se em várias linhas se for longo. */
  const linha = (rotulo: string, valor: string, forte = false) => {
    fonte(10, forte ? "bold" : "normal");
    const valores = quebrar(valor, util * 0.6);
    const h = Math.max(1, valores.length) * 4.8 + 2.8;
    espaco(h);
    fonte(9.5, "normal", CINZA_ESCURO).text(rotulo, M, y);
    fonte(10, forte ? "bold" : "normal").text(valores, L - M, y, { align: "right" });
    y += h - 2.8;
    doc
      .setDrawColor(...LINHA)
      .setLineWidth(0.2)
      .line(M, y - 1.2, L - M, y - 1.2);
    y += 3.6;
  };
  /** O valor que conta, numa faixa clara, a negrito. */
  const total = (rotulo: string, valor: string) => {
    espaco(14);
    y += 1;
    doc.setFillColor(...REALCE).rect(M, y - 5.4, util, 10, "F");
    fonte(10.5, "bold").text(rotulo, M + 4, y + 0.8);
    fonte(13, "bold").text(valor, L - M - 4, y + 1.2, { align: "right" });
    y += 9.5;
  };
  const paragrafo = (texto: string, cor: Cor = TINTA, tamanho = 10) => {
    fonte(tamanho, "normal", cor);
    const altura = tamanho * 0.5;
    const linhas = quebrar(texto, util);
    espaco(linhas.length * altura + 1);
    fonte(tamanho, "normal", cor).text(linhas, M, y);
    y += linhas.length * altura + 2.2;
  };
  /** Texto jurídico ou de condições: mais pequeno e em cinzento-escuro. */
  const legal = (texto: string) => paragrafo(texto, CINZA_ESCURO, 9);
  /** A assinatura no fim (D-184), com uma frase de despedida opcional por cima. */
  const assinatura = (a: Assinatura, despedida?: string) => {
    espaco(ALTURA_ASSINATURA + (despedida ? 16 : 8));
    y += 4;
    if (despedida) {
      fonte(10, "normal", CINZA_ESCURO).text(despedida, M, y);
      y += 9;
    }
    y = desenharAssinatura(doc, M, y, a) + 2;
  };
  const fechar = (rodape: string, pagina: (n: number, total: number) => string) => {
    const total = doc.getNumberOfPages();
    for (let n = 1; n <= total; n++) {
      doc.setPage(n);
      doc
        .setDrawColor(...LINHA)
        .setLineWidth(0.25)
        .line(M, A - 16, L - M, A - 16);
      fonte(7.5, "normal", CINZA).text(rodape, M, A - 10.5);
      doc.text(pagina(n, total), L - M, A - 10.5, { align: "right" });
    }
    return doc;
  };

  cabecalho();
  // prettier-ignore
  const folha = {
    doc, L, A, M, util, fonte, quebrar, novaPagina, espaco, sobretitulo, subtitulo, lead, meta,
    titulo, subtituloSeccao, linha, total, paragrafo, legal, assinatura, fechar,
    get y() {
      return y;
    },
    set y(v: number) {
      y = v;
    },
  };
  return Object.assign(folha, {
    lista: (itens: string[], colunas: 1 | 2 = 1) => desenharLista(folha, itens, colunas),
    passos: (itens: string[]) => desenharPassos(folha, itens),
    nota: (texto: string) => desenharNota(folha, texto),
    tabela: (colunas: string[], linhas: string[][]) => desenharTabela(folha, colunas, linhas),
    barras: (valores: Barra[]) => desenharBarras(folha, o.cor, valores),
  });
}

export type FolhaBase = Omit<Folha, "lista" | "passos" | "nota" | "tabela" | "barras">;
export type Folha = ReturnType<typeof criarFolha>;
