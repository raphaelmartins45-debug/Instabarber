import type { Assinatura } from "@/lib/documentos/assinatura";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { EXTRA_CENT, type RegimeIva } from "@/lib/regras/mensalidade";
import { codigoQr } from "@/lib/regras/qr";
import { type Simulacao, simularPreco, valorPorDiaCent } from "@/lib/regras/vendas";
import {
  type Cor,
  criarDocumento,
  DOURADO,
  desenharAssinatura,
  desenharLogo,
  FUNDO,
  LETRA,
  AMARELO_CLARO,
  CINZA_ESCURO,
  OURO_TEXTO,
  REALCE,
  TINTA,
} from "./estilo";

const CINZA_CLARO_PAPEL: Cor = [0x65, 0x65, 0x6e];
import { TELEMOVEL } from "./imagens-landing";
import { LOGO_DOURADO, LOGO_PRETO } from "./logos-marca";

// Folheto da visita (D-181, D-184): uma página A4 escura, como a landing. No topo, o título com
// «num só sistema.» a dourado e a página pública no telemóvel; a meio, os dois cartões de preços
// da landing (o valor por dia em grande, o mensal e o que inclui; o Pro com o contorno dourado e
// a marca «Recomendado»); no fundo, o QR do site e a assinatura de quem o gera. Letra Inter.

const t = textos.documentos.folheto;
/** As duas versões (D-185): preta, como a landing, e branca, para imprimir com menos tinta. */
const TEMAS = {
  preto: {
    fundo: FUNDO,
    texto: [0xf4, 0xf4, 0xf5] as Cor,
    cinza: [0xa1, 0xa1, 0xaa] as Cor,
    nota: [0x8b, 0x8b, 0x94] as Cor,
    cartao: [0x18, 0x18, 0x1b] as Cor,
    cartaoPro: [0x1d, 0x19, 0x12] as Cor,
    acento: DOURADO,
    logo: LOGO_DOURADO,
  },
  branco: {
    fundo: [0xff, 0xff, 0xff] as Cor,
    texto: TINTA,
    cinza: CINZA_ESCURO,
    nota: CINZA_CLARO_PAPEL,
    cartao: REALCE,
    cartaoPro: AMARELO_CLARO,
    acento: OURO_TEXTO,
    logo: LOGO_PRETO,
  },
};

export function gerarFolheto(d: {
  tema: keyof typeof TEMAS;
  regime: RegimeIva;
  site: string;
  contacto: Assinatura;
}) {
  const { fundo, texto: BRANCO, cinza: CINZA, nota: CINZA_FUNDO, cartao: CARTAO } = TEMAS[d.tema];
  const { cartaoPro: CARTAO_PRO, acento: ACENTO, logo } = TEMAS[d.tema];
  const doc = criarDocumento();
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const M = 15;
  const fonte = (n: number, peso: "normal" | "bold" | "black", cor: Cor) =>
    doc
      .setFont(LETRA, peso)
      .setFontSize(n)
      .setTextColor(...cor);
  const partir = (texto: string, largura: number) =>
    doc.splitTextToSize(texto, largura) as string[];

  doc.setFillColor(...fundo).rect(0, 0, L, A, "F");
  desenharLogo(doc, logo, M, 12, 11);

  // Topo: o título da landing à esquerda e a página pública no telemóvel à direita.
  const larguraTelemovel = 60;
  const xTelemovel = L - M - larguraTelemovel;
  const alturaTelemovel = larguraTelemovel / TELEMOVEL.proporcao;
  doc.addImage(
    TELEMOVEL.dados,
    TELEMOVEL.formato,
    xTelemovel,
    30,
    larguraTelemovel,
    alturaTelemovel,
    undefined,
    "FAST",
  );
  const coluna = xTelemovel - M - 8;
  let y = 46;
  fonte(30, "black", BRANCO);
  const titulo = partir(t.titulo, coluna);
  doc.text(titulo, M, y, { lineHeightFactor: 1.02, charSpace: -0.3 });
  y += titulo.length * 10.8;
  fonte(30, "black", ACENTO).text(t.tituloDestaque, M, y, { charSpace: -0.3 });
  y += 10;
  fonte(10.5, "normal", CINZA);
  const apoio = partir(t.subtitulo, coluna);
  doc.text(apoio, M, y, { lineHeightFactor: 1.5 });
  y += apoio.length * 5.5 + 3;
  fonte(9.5, "bold", BRANCO).text(t.garantias, M, y);

  // O que o sistema faz: seis pontos em duas colunas, por baixo do texto e ao lado do telemóvel.
  y += 11;
  const larguraPonto = (coluna - 6) / 2;
  t.funcionalidades.forEach(([nome, texto], i) => {
    const x = M + (i % 2) * (larguraPonto + 6);
    const yy = y + Math.floor(i / 2) * 15;
    doc.setFillColor(...DOURADO).rect(x, yy - 3.1, 1.1, 11, "F");
    fonte(9, "bold", BRANCO).text(nome, x + 4, yy);
    fonte(8, "normal", CINZA).text(partir(texto, larguraPonto - 4).slice(0, 2), x + 4, yy + 4.3, {
      lineHeightFactor: 1.3,
    });
  });
  y += 3 * 15;

  // Os dois cartões de preços, como na landing.
  const yCartoes = Math.max(30 + alturaTelemovel, y) + 8;
  const g = 6;
  const largura = (L - 2 * M - g) / 2;
  const altura = 78;
  const planos = (["basic", "pro"] as const).map((p) => simularPreco(p, 0, false, d.regime));
  planos.forEach((s: Simulacao, i) => {
    const x = M + i * (largura + g);
    const pro = s.plano === "pro";
    doc
      .setFillColor(...(pro ? CARTAO_PRO : CARTAO))
      .roundedRect(x, yCartoes, largura, altura, 4, 4, "F");
    if (pro)
      doc
        .setDrawColor(...DOURADO)
        .setLineWidth(0.5)
        .roundedRect(x, yCartoes, largura, altura, 4, 4, "S");
    const nome = textos.vendas.simulador.planos[s.plano];
    fonte(12, "bold", BRANCO).text(nome, x + 7, yCartoes + 12);
    if (pro) {
      const xEtiqueta = x + 9 + doc.getTextWidth(nome);
      fonte(6.5, "bold", FUNDO);
      const larguraEtiqueta = doc.getTextWidth(t.recomendado.toUpperCase()) + 7;
      doc
        .setFillColor(...DOURADO)
        .roundedRect(xEtiqueta, yCartoes + 7.6, larguraEtiqueta, 5.6, 2.8, 2.8, "F");
      doc.text(t.recomendado.toUpperCase(), xEtiqueta + 3.5, yCartoes + 11.4, { charSpace: 0.3 });
    }
    const dia = formatarDinheiro(valorPorDiaCent(s.mensalCent));
    fonte(28, "black", BRANCO).text(dia, x + 7, yCartoes + 27, { charSpace: -0.3 });
    const largDia = doc.getTextWidth(dia);
    fonte(9, "normal", CINZA).text(t.porDia, x + 9 + largDia, yCartoes + 27);
    fonte(9, "normal", BRANCO).text(t.mensal(formatarDinheiro(s.mensalCent)), x + 7, yCartoes + 34);
    let yy = yCartoes + 45;
    for (const item of t.inclui[s.plano] ?? []) {
      doc.setFillColor(...DOURADO).roundedRect(x + 7, yy - 2.6, 2.2, 2.2, 0.5, 0.5, "F");
      fonte(9, "normal", BRANCO).text(partir(item, largura - 20)[0]!, x + 12.5, yy);
      yy += 7;
    }
  });

  // Fundo: QR do site, o convite e a assinatura de quem gera o folheto.
  const yFundo = yCartoes + altura + 12;
  const lado = 24;
  const matriz = codigoQr(d.site);
  doc.setFillColor(255, 255, 255).roundedRect(M, yFundo, lado, lado, 2, 2, "F");
  if (d.tema === "branco")
    doc
      .setDrawColor(...REALCE)
      .setLineWidth(0.4)
      .roundedRect(M, yFundo, lado, lado, 2, 2, "S");
  if (matriz) {
    const m = (lado - 4) / matriz.length;
    doc.setFillColor(0, 0, 0);
    matriz.forEach((linha, j) =>
      linha.forEach((escuro, i) => {
        if (escuro) doc.rect(M + 2 + i * m, yFundo + 2 + j * m, m + 0.02, m + 0.02, "F");
      }),
    );
  }
  fonte(13, "bold", BRANCO).text(t.cta, M + lado + 6, yFundo + 7);
  fonte(9, "normal", CINZA).text(t.qr, M + lado + 6, yFundo + 12.5);
  fonte(10.5, "bold", ACENTO).text(d.site.replace(/^https?:\/\//, ""), M + lado + 6, yFundo + 19);
  const xContacto = M + largura + g;
  fonte(9, "bold", ACENTO).text(t.contactoTitulo, xContacto, yFundo + 2);
  desenharAssinatura(doc, xContacto, yFundo + 8.5, d.contacto, { nome: BRANCO, linhas: CINZA });

  fonte(7, "normal", CINZA_FUNDO).text(
    `${t.extra(formatarDinheiro(EXTRA_CENT.pro))} ${t.iva[d.regime]} ${t.diasNota}`,
    M,
    A - 6,
  );
  return doc;
}
