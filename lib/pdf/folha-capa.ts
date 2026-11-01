import type { Assinatura } from "@/lib/documentos/assinatura";
import { DOURADO, desenharAssinatura, desenharLogo, FUNDO, rotuloEspacado } from "./estilo";
import type { Folha } from "./folha";
import { LOGO_DOURADO } from "./logos-marca";

// Capa escura dos documentos comerciais (D-184): o logótipo oficial a dourado, o tipo de
// documento, o título grande, os dados em colunas e, no fundo, quem assina.

const CINZA_CLARO: [number, number, number] = [0xa1, 0xa1, 0xaa];
const BRANCO: [number, number, number] = [0xf4, 0xf4, 0xf5];
const FILETE: [number, number, number] = [0x2e, 0x2b, 0x27];

export function capaEscura(
  f: Folha,
  o: {
    rotulo: string;
    titulo: string;
    lead?: string | null;
    meta: [string, string][];
    assinatura?: Assinatura;
    site: string;
  },
) {
  f.capa(() => {
    const { doc, L, A, M, util, fonte, quebrar } = f;
    doc.setFillColor(...FUNDO).rect(0, 0, L, A, "F");
    doc.setFillColor(...DOURADO).rect(0, 0, L, 2, "F");
    desenharLogo(doc, LOGO_DOURADO, M, 22, 14);

    let y = 118;
    doc.setFillColor(...DOURADO).rect(M, y, 26, 1.3, "F");
    y += 12;
    fonte(9, "bold", DOURADO);
    rotuloEspacado(doc, o.rotulo, M, y, "left", 0.5);
    y += 13;
    fonte(32, "bold", BRANCO);
    const titulo = quebrar(o.titulo, util);
    doc.text(titulo, M, y);
    y += titulo.length * 12.5;
    if (o.lead) fonte(13, "normal", CINZA_CLARO).text(o.lead, M, y);

    const w = util / o.meta.length;
    const yMeta = 214;
    doc
      .setDrawColor(...FILETE)
      .setLineWidth(0.3)
      .line(M, yMeta - 8, L - M, yMeta - 8);
    o.meta.forEach(([rotulo, valor], i) => {
      fonte(7.5, "bold", CINZA_CLARO);
      rotuloEspacado(doc, rotulo, M + i * w, yMeta, "left", 0.4);
      fonte(12, "bold", BRANCO).text(valor, M + i * w, yMeta + 7);
    });

    const yFundo = 248;
    doc.line(M, yFundo - 8, L - M, yFundo - 8);
    if (o.assinatura)
      desenharAssinatura(doc, M, yFundo, o.assinatura, { nome: BRANCO, linhas: CINZA_CLARO });
    fonte(10, "bold", DOURADO).text(o.site, L - M, A - 18, { align: "right" });
  });
}
