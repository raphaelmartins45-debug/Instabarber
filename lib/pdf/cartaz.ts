import { textos } from "@/lib/i18n/pt-PT";
import { corDoTexto } from "@/lib/regras/contraste";
import { codigoQr } from "@/lib/regras/qr";
import { corDeHex, criarDocumento, desenharLogo } from "./estilo";
import type { Imagem } from "./guia-primitivas";
import { LOGO_BRANCO, LOGO_PRETO } from "./logos-marca";

// Cartaz do balcão (D-181, D-184): A4 a toda a cor da barbearia. O logótipo da barbearia num
// quadro branco, o nome, a mensagem em letra grande, o código QR da marcação num quadrado branco
// (com a margem que os leitores pedem), o endereço escrito e, no fundo, o logótipo da InstaBarber
// a branco ou a preto conforme o contraste com a cor.

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
  const doc = criarDocumento();
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const fundo = /^#[0-9a-f]{6}$/i.test(d.cor ?? "") ? d.cor! : "#12100E";
  const claroSobre = corDoTexto(fundo).toUpperCase() === "#FFFFFF";
  const texto = corDeHex(corDoTexto(fundo));
  doc.setFillColor(...corDeHex(fundo)).rect(0, 0, L, A, "F");
  const centro = { align: "center" as const };

  let y = 22;
  if (d.logo) {
    try {
      const { width, height } = doc.getImageProperties(d.logo.dados);
      const escala = 30 / Math.max(width, height);
      doc.setFillColor(255, 255, 255).rect(L / 2 - 19, y, 38, 38, "F");
      doc.addImage(
        d.logo.dados,
        d.logo.formato,
        L / 2 - (width * escala) / 2,
        y + 19 - (height * escala) / 2,
        width * escala,
        height * escala,
        undefined,
        "FAST",
      );
      y += 46;
    } catch {
      // Sem logótipo legível, o nome basta.
    }
  }
  doc
    .setTextColor(...texto)
    .setFont("helvetica", "bold")
    .setFontSize(18);
  doc.text(doc.splitTextToSize(d.barbearia, L - 40) as string[], L / 2, y + 6, centro);
  y += 20;
  doc.setFontSize(38);
  // Largura escolhida para o título partir em duas linhas equilibradas.
  const titulo = doc.splitTextToSize(t.titulo, 120) as string[];
  doc.text(titulo, L / 2, y + 6, { ...centro, lineHeightFactor: 1.05 });
  y += titulo.length * 14 + 4;

  const lado = 104;
  const x0 = (L - lado) / 2;
  doc.setFillColor(255, 255, 255).rect(x0 - 9, y, lado + 18, lado + 18, "F");
  const matriz = codigoQr(d.qr);
  if (matriz) {
    const m = lado / matriz.length;
    doc.setFillColor(0, 0, 0);
    matriz.forEach((linha, j) =>
      linha.forEach((escuro, i) => {
        if (escuro) doc.rect(x0 + i * m, y + 9 + j * m, m + 0.02, m + 0.02, "F");
      }),
    );
  }
  y += lado + 30;
  doc
    .setTextColor(...texto)
    .setFont("helvetica", "normal")
    .setFontSize(14);
  doc.text(doc.splitTextToSize(t.texto, L - 50) as string[], L / 2, y, centro);
  y += 17;
  doc.setFont("helvetica", "bold").setFontSize(17);
  doc.text(d.endereco.replace(/^https?:\/\//, ""), L / 2, y, centro);
  desenharLogo(doc, claroSobre ? LOGO_BRANCO : LOGO_PRETO, L / 2, A - 22, 9, "center");
  return doc;
}
