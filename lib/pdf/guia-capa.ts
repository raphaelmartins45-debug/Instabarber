import type { Assinatura } from "@/lib/documentos/assinatura";
import { ALTURA_ASSINATURA, CINZA_ESCURO, DOURADO, desenharAssinatura, FUNDO } from "./estilo";
import type { Guia, Imagem } from "./guia-primitivas";

// Capa e assinatura dos guias personalizados (D-181, D-184).

/** Texto secundário e terciário sobre o fundo escuro (`--texto-2` e `--texto-3` do escuro). */
const CINZA_CLARO: [number, number, number] = [0xa1, 0xa1, 0xaa];
const TER: [number, number, number] = [0x8b, 0x8b, 0x94];

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

/** Assinatura no fim (D-184): nos manuais, «Apoio ao cliente», com o WhatsApp e o e-mail. */
export function assinatura(g: Guia, o: { despedida: string; assinatura: Assinatura }) {
  g.espaco(ALTURA_ASSINATURA + 20);
  g.y += 4;
  g.fonte(10.5, "normal", CINZA_ESCURO).text(o.despedida, g.M, g.y);
  g.y += 7;
  g.doc
    .setDrawColor(...DOURADO)
    .setLineWidth(0.4)
    .line(g.M, g.y, g.M + 40, g.y);
  g.y = desenharAssinatura(g.doc, g.M, g.y + 7, o.assinatura) + 2;
}
