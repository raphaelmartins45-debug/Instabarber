import type { Assinatura } from "@/lib/documentos/assinatura";
import {
  ALTURA_ASSINATURA,
  CINZA_ESCURO,
  DOURADO,
  desenharAssinatura,
  desenharLogo,
  FUNDO,
} from "./estilo";
import type { Guia, Imagem } from "./guia-primitivas";
import { LOGO_DOURADO } from "./logos-marca";

// Capa e assinatura dos guias personalizados (D-181, D-184).

/** Texto secundário sobre o fundo escuro (`--texto-2` do modo escuro). */
const CINZA_CLARO: [number, number, number] = [0xa1, 0xa1, 0xaa];

/** Capa escura: o logótipo da barbearia (ou a inicial), o título e o logótipo da InstaBarber. */
export function capa(
  g: Guia,
  o: {
    logo: Imagem | null;
    inicial: string;
    sobre: string;
    titulo: string;
    texto: string;
    site: string;
  },
) {
  const { doc, L, A, fonte } = g;
  doc.setFillColor(...FUNDO).rect(0, 0, L, A, "F");
  doc.setFillColor(...DOURADO).rect(0, 0, L, 2, "F");
  // O logótipo da barbearia num quadro branco, para se ler sempre sobre a capa escura.
  doc.setFillColor(255, 255, 255).roundedRect(20, 36, 62, 62, 4, 4, "F");
  let comLogo = false;
  if (o.logo) {
    try {
      // Cabe no quadro de 52 mm sem deformar.
      const { width, height } = doc.getImageProperties(o.logo.dados);
      const escala = 52 / Math.max(width, height);
      const [w, h] = [width * escala, height * escala];
      doc.addImage(o.logo.dados, o.logo.formato, 51 - w / 2, 67 - h / 2, w, h, undefined, "FAST");
      comLogo = true;
    } catch {
      comLogo = false;
    }
  }
  if (!comLogo) fonte(40, "bold", FUNDO).text(o.inicial, 51, 75, { align: "center" });
  doc.setFillColor(...DOURADO).roundedRect(20, 168, 34, 1.4, 0.7, 0.7, "F");
  fonte(12, "normal", CINZA_CLARO).text(o.sobre, 20, 182);
  fonte(30, "bold", [0xf4, 0xf4, 0xf5]);
  const titulo = g.quebrar(o.titulo, L - 40);
  doc.text(titulo, 20, 196);
  const yTexto = 196 + titulo.length * 12;
  fonte(12.5, "normal", CINZA_CLARO).text(g.quebrar(o.texto, 130), 20, yTexto);
  desenharLogo(doc, LOGO_DOURADO, 20, A - 30, 11);
  fonte(10, "bold", DOURADO).text(o.site, L - 20, A - 22, { align: "right" });
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
