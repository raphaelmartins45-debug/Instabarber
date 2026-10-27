import { DOURADO } from "./folha";
import { FUNDO, type Guia, type Imagem } from "./guia-primitivas";

// Capa e assinatura dos guias personalizados (D-181).

const CINZA_CLARO: [number, number, number] = [0xa1, 0xa1, 0xaa];
const TER: [number, number, number] = [0x71, 0x71, 0x7a];

/** Capa escura: logótipo (ou a inicial), título, nome da barbearia e o rodapé da marca. */
export function capa(
  g: Guia,
  o: {
    logo: Imagem | null;
    inicial: string;
    sobre: string;
    titulo: string;
    texto: string;
    rodape: [string, string];
  },
) {
  const { doc, L, A, fonte } = g;
  doc.setFillColor(...FUNDO).rect(0, 0, L, A, "F");
  if (o.logo) {
    try {
      doc.addImage(o.logo.dados, o.logo.formato, 20, 26, 42, 42, undefined, "FAST");
    } catch {
      o.logo = null;
    }
  }
  if (!o.logo) {
    doc.setFillColor(0x27, 0x27, 0x2a).circle(41, 47, 21, "F");
    fonte(30, "bold", DOURADO).text(o.inicial, 41, 57.5, { align: "center" });
  }
  doc.setFillColor(...DOURADO).roundedRect(20, 168, 34, 1.4, 0.7, 0.7, "F");
  fonte(12, "normal", CINZA_CLARO).text(o.sobre, 20, 182);
  fonte(30, "bold", [0xf4, 0xf4, 0xf5]);
  const titulo = g.quebrar(o.titulo, L - 40);
  doc.text(titulo, 20, 196);
  const yTexto = 196 + titulo.length * 12;
  fonte(12.5, "normal", CINZA_CLARO).text(g.quebrar(o.texto, 130), 20, yTexto);
  fonte(9, "normal", TER).text(o.rodape[0], 20, A - 20);
  doc.text(o.rodape[1], L - 20, A - 20, { align: "right" });
}

/** Assinatura no fim (D-181): o nome de quem gerou, a função e a marca. */
export function assinatura(g: Guia, o: { despedida: string; nome: string; funcao: string }) {
  g.espaco(30);
  g.y += 4;
  g.fonte(10.5, "normal", TER).text(o.despedida, g.M, g.y);
  g.y += 12;
  g.doc
    .setDrawColor(...DOURADO)
    .setLineWidth(0.4)
    .line(g.M, g.y - 5, g.M + 60, g.y - 5);
  g.fonte(12, "bold").text(o.nome, g.M, g.y);
  g.y += 5.5;
  g.fonte(9.5, "normal", TER).text(o.funcao, g.M, g.y);
  g.y += 6;
}
