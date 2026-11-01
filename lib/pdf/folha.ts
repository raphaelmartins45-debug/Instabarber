import type { Assinatura } from "@/lib/documentos/assinatura";
import {
  ALTURA_ASSINATURA,
  CINZA,
  CINZA_ESCURO,
  type Cor,
  criarDocumento,
  desenharAssinatura,
  desenharLogo,
  DOURADO,
  LINHA,
  OURO_TEXTO,
  REALCE,
  rotuloEspacado,
  TINTA,
} from "./estilo";
import {
  type Barra,
  desenharBarras,
  desenharLead,
  desenharMeta,
  desenharSobretitulo,
  desenharLista,
  desenharNota,
  desenharPassos,
  desenharTabela,
} from "./folha-blocos";
import { LOGO_PRETO } from "./logos-marca";

export { type Cor, corDeHex, DOURADO } from "./estilo";

// Folha A4 dos documentos de gestão (D-184): papel timbrado discreto (filete de cor, marca e tipo
// de documento), títulos a preto, linhas de valores, total, assinatura e rodapé paginado. Listas,
// passos, notas, tabelas e barras em folha-blocos.ts. O dourado só em marcadores e filetes.

const M = 20;

export function criarFolha(o: { titulo: string; cor: Cor; numerar?: boolean }) {
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
    desenharLogo(doc, LOGO_PRETO, M, 9.5, 7.5);
    fonte(7.5, "bold", CINZA);
    rotuloEspacado(doc, o.titulo, L - M, 14.6, "right");
    doc
      .setDrawColor(...LINHA)
      .setLineWidth(0.25)
      .line(M, 21, L - M, 21);
    y = 33;
  };
  const novaPagina = () => {
    doc.addPage();
    cabecalho();
  };
  /** Se o bloco não cabe, continua na página seguinte. */
  const espaco = (mm: number) => {
    if (y + mm > A - 24) novaPagina();
  };

  /** O título do documento (primeira página). */
  const subtitulo = (texto: string) => {
    fonte(20, "bold");
    const linhas = quebrar(texto, util);
    espaco(linhas.length * 8 + 4);
    doc.text(linhas, M, y);
    y += linhas.length * 8 + 2;
  };
  let seccao = 0;
  /** Título de secção, com o número a dourado quando a folha numera (`numerar`). */
  const titulo = (texto: string, manter = 18) => {
    espaco(manter);
    y += 6;
    if (o.numerar) {
      fonte(12.5, "bold", OURO_TEXTO).text(String(++seccao).padStart(2, "0"), M, y);
      fonte(13, "bold").text(texto, M + 10, y);
    } else fonte(13, "bold").text(texto, M, y);
    doc.setFillColor(...DOURADO).rect(M, y + 2.2, 8, 0.7, "F");
    y += 9;
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
  let comCapa = false;
  /** A página 1 passa a ser uma capa (folha-capa.ts): sem cabeçalho nem rodapé, fora da contagem. */
  const capa = (desenhar: () => void) => {
    comCapa = true;
    doc.setFillColor(255, 255, 255).rect(0, 0, L, A, "F");
    desenhar();
    novaPagina();
  };
  const fechar = (rodape: string, pagina: (n: number, total: number) => string) => {
    const inicio = comCapa ? 2 : 1;
    const total = doc.getNumberOfPages() - inicio + 1;
    for (let n = inicio; n <= doc.getNumberOfPages(); n++) {
      doc.setPage(n);
      doc
        .setDrawColor(...LINHA)
        .setLineWidth(0.25)
        .line(M, A - 16, L - M, A - 16);
      fonte(7.5, "normal", CINZA).text(rodape, M, A - 10.5);
      doc.text(pagina(n - inicio + 1, total), L - M, A - 10.5, { align: "right" });
    }
    return doc;
  };

  cabecalho();
  // prettier-ignore
  const folha = {
    doc, L, A, M, util, fonte, quebrar, novaPagina, espaco, subtitulo,
    titulo, subtituloSeccao, linha, total, paragrafo, legal, assinatura, capa, fechar,
    get y() {
      return y;
    },
    set y(v: number) {
      y = v;
    },
  };
  return Object.assign(folha, {
    sobretitulo: (texto: string) => desenharSobretitulo(folha, texto),
    lead: (texto: string) => desenharLead(folha, texto),
    meta: (pares: [string, string][]) => desenharMeta(folha, pares),
    lista: (itens: string[], colunas: 1 | 2 = 1) => desenharLista(folha, itens, colunas),
    passos: (itens: string[]) => desenharPassos(folha, itens),
    nota: (texto: string) => desenharNota(folha, texto),
    tabela: (colunas: string[], linhas: string[][]) => desenharTabela(folha, colunas, linhas),
    barras: (valores: Barra[]) => desenharBarras(folha, o.cor, valores),
  });
}

export type FolhaBase = Omit<
  Folha,
  "sobretitulo" | "lead" | "meta" | "lista" | "passos" | "nota" | "tabela" | "barras"
>;
export type Folha = ReturnType<typeof criarFolha>;
