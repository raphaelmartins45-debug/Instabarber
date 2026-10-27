import { jsPDF } from "jspdf";
import { textos } from "@/lib/i18n/pt-PT";
import { codigoQr } from "@/lib/regras/qr";
import { corDoTexto } from "@/lib/regras/contraste";
import { corDeHex } from "./folha";
import type { Imagem } from "./guia-primitivas";

// Cartaz do balcão (D-181): A4 na cor da barbearia, com o logótipo, o nome e o código QR da
// página de marcação. O QR vai num quadrado branco, com a margem que os leitores pedem.

const t = textos.documentos.cartaz;

export function gerarCartaz(d: {
  barbearia: string;
  cor: string | null;
  logo: Imagem | null;
  /** Para onde o QR leva (a marcação). */
  qr: string;
  /** O endereço escrito por baixo (a página). */
  endereco: string;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const fundo = /^#[0-9a-f]{6}$/i.test(d.cor ?? "") ? d.cor! : "#12100E";
  const texto = corDeHex(corDoTexto(fundo));
  doc.setFillColor(...corDeHex(fundo)).rect(0, 0, L, A, "F");

  let y = 26;
  if (d.logo) {
    try {
      doc.addImage(d.logo.dados, d.logo.formato, L / 2 - 20, y, 40, 40, undefined, "FAST");
      y += 48;
    } catch {
      // Sem logótipo legível, o nome basta.
    }
  }
  doc
    .setTextColor(...texto)
    .setFont("helvetica", "bold")
    .setFontSize(26);
  const nome = doc.splitTextToSize(d.barbearia, L - 40) as string[];
  doc.text(nome, L / 2, y + 8, { align: "center" });
  y += 8 + nome.length * 10 + 6;
  doc.setFontSize(20).text(t.titulo, L / 2, y, { align: "center" });
  y += 10;

  const matriz = codigoQr(d.qr);
  const lado = 110;
  const x0 = (L - lado) / 2;
  doc.setFillColor(255, 255, 255).roundedRect(x0 - 8, y, lado + 16, lado + 16, 4, 4, "F");
  if (matriz) {
    const m = lado / matriz.length;
    doc.setFillColor(0, 0, 0);
    matriz.forEach((linha, j) =>
      linha.forEach((escuro, i) => {
        if (escuro) doc.rect(x0 + i * m, y + 8 + j * m, m + 0.02, m + 0.02, "F");
      }),
    );
  }
  y += lado + 28;
  doc
    .setTextColor(...texto)
    .setFont("helvetica", "normal")
    .setFontSize(13);
  doc.text(doc.splitTextToSize(t.texto, L - 50) as string[], L / 2, y, { align: "center" });
  y += 16;
  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text(d.endereco.replace(/^https?:\/\//, ""), L / 2, y, { align: "center" });
  doc
    .setFont("helvetica", "normal")
    .setFontSize(9)
    .text(t.rodape, L / 2, A - 14, { align: "center" });
  return doc;
}
