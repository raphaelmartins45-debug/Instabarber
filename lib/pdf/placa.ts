import type { jsPDF } from "jspdf";
import { textos } from "@/lib/i18n/pt-PT";
import { corDoTexto } from "@/lib/regras/contraste";
import { codigoQr } from "@/lib/regras/qr";
import type { EscolhaPlaca } from "@/lib/validacao/placa";
import { type Cor, corDeHex, criarDocumento, DOURADO, desenharLogo, FUNDO, LETRA } from "./estilo";
import type { Imagem } from "./guia-primitivas";
import { LOGO_BRANCO, LOGO_PRETO } from "./logos-marca";

// A placa do balcão (D-185): A4 para afixar, com o título, a frase e a vantagem que o gestor
// escolheu, o código QR da marcação e, com a fidelização ligada, o cartão de selos desenhado,
// para o cliente perceber que marcar online lhe dá pontos. Três modelos: Selos (papel claro com
// a cor da barbearia), Escuro e dourado, e Cor da barbearia. O mesmo gerador serve o gestor e o
// cartaz do Admin.

const t = textos.documentos.cartaz;
const PAPEL: Cor = [0xf3, 0xee, 0xe5];
const AREIA: Cor = [0xe6, 0xdd, 0xce];
const BRANCO: Cor = [0xff, 0xff, 0xff];

export type DadosPlaca = EscolhaPlaca & {
  barbearia: string;
  cor: string | null;
  logo: Imagem | null;
  /** Para onde o QR leva (a marcação). */
  qr: string;
  /** O endereço escrito (a página). */
  endereco: string;
  /** Selos do cartão desenhado; nulo se a barbearia não tem a fidelização por selos. */
  selos: number | null;
};

type Tema = {
  fundo: Cor;
  tinta: Cor;
  suave: Cor;
  acento: Cor;
  selo: Cor;
  /** O fundo do cartão de selos. */
  cartao: Cor;
  logo: typeof LOGO_PRETO;
};

function tema(d: DadosPlaca): Tema {
  const marca = /^#[0-9a-f]{6}$/i.test(d.cor ?? "") ? d.cor! : "#12100E";
  if (d.modelo === "escuro")
    return {
      fundo: FUNDO,
      tinta: [0xf4, 0xf4, 0xf5],
      suave: [0xa1, 0xa1, 0xaa],
      acento: DOURADO,
      selo: DOURADO,
      cartao: [0x18, 0x18, 0x1b],
      logo: LOGO_BRANCO,
    };
  if (d.modelo === "cor") {
    const claro = corDoTexto(marca).toUpperCase() === "#FFFFFF";
    const tinta = corDeHex(corDoTexto(marca));
    return {
      fundo: corDeHex(marca),
      tinta,
      suave: tinta,
      acento: BRANCO,
      selo: BRANCO,
      // Um tom mais escuro ou mais claro da própria cor, para o cartão se destacar sem riscas.
      cartao: corDeHex(marca).map((v) =>
        claro ? Math.round(v * 0.78) : Math.round(v + (255 - v) * 0.3),
      ) as Cor,
      logo: claro ? LOGO_BRANCO : LOGO_PRETO,
    };
  }
  return {
    fundo: PAPEL,
    tinta: [0x12, 0x10, 0x0e],
    suave: [0x5c, 0x56, 0x4e],
    acento: DOURADO,
    selo: corDeHex(marca),
    cartao: AREIA,
    logo: LOGO_PRETO,
  };
}

/** O logótipo da barbearia num quadro branco, sem deformar. Devolve se conseguiu desenhar. */
function logoDaBarbearia(doc: jsPDF, logo: Imagem | null, x: number, y: number, lado: number) {
  if (!logo) return false;
  try {
    const { width, height } = doc.getImageProperties(logo.dados);
    const e = (lado - 6) / Math.max(width, height);
    doc.setFillColor(...BRANCO).rect(x, y, lado, lado, "F");
    doc.addImage(
      logo.dados,
      logo.formato,
      x + lado / 2 - (width * e) / 2,
      y + lado / 2 - (height * e) / 2,
      width * e,
      height * e,
      undefined,
      "FAST",
    );
    return true;
  } catch {
    return false;
  }
}

/** O cartão de selos desenhado: os primeiros já ganhos, o último é o prémio. */
function cartaoSelos(doc: jsPDF, x: number, y: number, largura: number, n: number, c: Tema) {
  const total = Math.min(Math.max(n, 5), 10);
  const raio = 6.2;
  const passo = (largura - 20) / total;
  doc.setFillColor(...c.cartao).rect(x, y, largura, 30, "F");
  for (let i = 0; i < total; i++) {
    const cx = x + 10 + passo * i + passo / 2;
    const cy = y + 15;
    if (i === total - 1) {
      doc.setFillColor(...DOURADO).circle(cx, cy, raio, "F");
      doc
        .setFont(LETRA, "bold")
        .setFontSize(6)
        .setTextColor(...FUNDO)
        .text(t.premio, cx, cy + 1, { align: "center" });
    } else if (i < 3) doc.setFillColor(...c.selo).circle(cx, cy, raio, "F");
    else
      doc
        .setDrawColor(...c.suave)
        .setLineWidth(0.6)
        .circle(cx, cy, raio, "S");
  }
}

export function gerarPlaca(d: DadosPlaca) {
  const doc = criarDocumento();
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const M = 20;
  const c = tema(d);
  const fonte = (n: number, peso: "normal" | "bold", cor: Cor) =>
    doc
      .setFont(LETRA, peso)
      .setFontSize(n)
      .setTextColor(...cor);
  doc.setFillColor(...c.fundo).rect(0, 0, L, A, "F");
  if (d.modelo === "selos") doc.setFillColor(...c.selo).rect(0, 0, L, 8, "F");

  // Identificação: o logótipo da barbearia e o nome.
  const comLogo = logoDaBarbearia(doc, d.logo, M, 22, 28);
  fonte(16, "bold", c.tinta).text(d.barbearia, comLogo ? M + 35 : M, comLogo ? 38 : 34);

  // A mensagem: título grande, frase e a vantagem num selo de cor.
  let y = 82;
  fonte(40, "bold", c.tinta);
  const titulo = doc.splitTextToSize(d.titulo, L - 2 * M) as string[];
  doc.text(titulo, M, y, { lineHeightFactor: 1.02 });
  y += titulo.length * 14.4 + 2;
  if (d.frase) {
    fonte(15, "normal", c.suave);
    const frase = doc.splitTextToSize(d.frase, L - 2 * M - 10) as string[];
    doc.text(frase, M, y, { lineHeightFactor: 1.35 });
    y += frase.length * 7.2 + 6;
  }
  if (d.vantagem) {
    fonte(15, "bold", FUNDO);
    const w = doc.getTextWidth(d.vantagem) + 16;
    doc.setFillColor(...c.acento).rect(M, y, w, 14, "F");
    fonte(15, "bold", d.modelo === "cor" ? corDeHex("#12100E") : FUNDO).text(
      d.vantagem,
      M + 8,
      y + 9.4,
    );
    y += 22;
  }
  if (d.selos !== null) cartaoSelos(doc, M, y, L - 2 * M, d.selos, c);

  // O código QR num quadrado branco e, ao lado, como usar e o endereço.
  const lado = 70;
  const yQr = A - 30 - lado;
  doc.setFillColor(...BRANCO).rect(M, yQr, lado, lado, "F");
  const matriz = codigoQr(d.qr);
  if (matriz) {
    const m = (lado - 10) / matriz.length;
    doc.setFillColor(0, 0, 0);
    matriz.forEach((linha, j) =>
      linha.forEach(
        (escuro, i) => escuro && doc.rect(M + 5 + i * m, yQr + 5 + j * m, m + 0.02, m + 0.02, "F"),
      ),
    );
  }
  const xt = M + lado + 10;
  fonte(17, "bold", c.tinta).text(
    doc.splitTextToSize(t.instrucao, L - M - xt) as string[],
    xt,
    yQr + 20,
  );
  fonte(15, "bold", d.modelo === "escuro" ? DOURADO : c.tinta).text(
    d.endereco.replace(/^https?:\/\//, ""),
    xt,
    yQr + 44,
  );
  desenharLogo(doc, c.logo, M, A - 19, 8);
  return doc;
}
