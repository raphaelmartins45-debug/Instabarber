import type { Assinatura } from "@/lib/documentos/assinatura";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { EXTRA_CENT, type RegimeIva } from "@/lib/regras/mensalidade";
import { codigoQr } from "@/lib/regras/qr";
import { simularPreco, valorPorDiaCent } from "@/lib/regras/vendas";
import {
  type Cor,
  criarDocumento,
  DOURADO,
  desenharAssinatura,
  desenharLogo,
  FUNDO,
} from "./estilo";
import { TELEMOVEL } from "./imagens-landing";
import { LOGO_DOURADO } from "./logos-marca";

// Folheto da visita (D-181, D-184): uma página A4 escura, com o topo da landing (o título com
// «num só sistema.» a dourado e a página pública no telemóvel), o que o sistema faz, uma faixa
// dourada com o valor por dia em destaque, o QR do site e a assinatura de quem o gera.

const t = textos.documentos.folheto;
const BRANCO: Cor = [0xf4, 0xf4, 0xf5];
const CINZA_CLARO: Cor = [0xa1, 0xa1, 0xaa];
const CINZA_FUNDO: Cor = [0x8b, 0x8b, 0x94];

export function gerarFolheto(d: { regime: RegimeIva; site: string; contacto: Assinatura }) {
  const doc = criarDocumento();
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const M = 15;
  const fonte = (n: number, peso: "normal" | "bold", cor: Cor) =>
    doc
      .setFont("helvetica", peso)
      .setFontSize(n)
      .setTextColor(...cor);
  const partir = (texto: string, largura: number) =>
    doc.splitTextToSize(texto, largura) as string[];

  doc.setFillColor(...FUNDO).rect(0, 0, L, A, "F");
  desenharLogo(doc, LOGO_DOURADO, M, 12, 11);

  // Topo: o título da landing à esquerda e a página pública no telemóvel à direita.
  const larguraTelemovel = 64;
  const xTelemovel = L - M - larguraTelemovel;
  doc.addImage(
    TELEMOVEL.dados,
    "JPEG",
    xTelemovel,
    32,
    larguraTelemovel,
    larguraTelemovel / TELEMOVEL.proporcao,
    undefined,
    "FAST",
  );
  const coluna = xTelemovel - M - 8;
  let y = 46;
  fonte(29, "bold", BRANCO);
  const titulo = partir(t.titulo, coluna);
  doc.text(titulo, M, y, { lineHeightFactor: 1.05 });
  y += titulo.length * 10.7;
  fonte(29, "bold", DOURADO).text(t.tituloDestaque, M, y);
  y += 10;
  fonte(10.5, "normal", CINZA_CLARO);
  const apoio = partir(t.subtitulo, coluna);
  doc.text(apoio, M, y, { lineHeightFactor: 1.45 });
  y += apoio.length * 5.4 + 3;
  fonte(9, "bold", BRANCO).text(t.garantias, M, y);

  // O que faz: seis pontos em duas colunas, título a branco e frase a cinzento.
  y = 164;
  const largura = (L - 2 * M - 10) / 2;
  t.funcionalidades.forEach(([nome, texto], i) => {
    const x = M + (i % 2) * (largura + 10);
    const yy = y + Math.floor(i / 2) * 14.5;
    doc.setFillColor(...DOURADO).rect(x, yy - 3, 1.2, 9, "F");
    fonte(10.5, "bold", BRANCO).text(nome, x + 4.5, yy);
    fonte(8.5, "normal", CINZA_CLARO).text(partir(texto, largura - 5)[0]!, x + 4.5, yy + 4.6);
  });

  // Faixa dourada: o valor por dia em destaque e os dois planos.
  const yFaixa = 206;
  const altura = 44;
  doc.setFillColor(...DOURADO).rect(0, yFaixa, L, altura, "F");
  const [basic, pro] = (["basic", "pro"] as const).map((p) => simularPreco(p, 0, false, d.regime));
  const desde = formatarDinheiro(valorPorDiaCent(basic!.mensalCent));
  fonte(11, "bold", FUNDO).text(t.desde, M, yFaixa + 12);
  fonte(44, "bold", FUNDO).text(desde, M, yFaixa + 29);
  const largDesde = doc.getTextWidth(desde);
  fonte(14, "bold", FUNDO).text(t.porDia, M + largDesde + 3, yFaixa + 29);
  fonte(10, "normal", FUNDO).text(t.cafe, M, yFaixa + 37);
  const xPlanos = 112;
  [basic!, pro!].forEach((s, i) => {
    const x = xPlanos + i * 44;
    fonte(9, "bold", FUNDO).text(
      partir(t.plano(textos.vendas.simulador.planos[s.plano], t.barbeiros[s.plano]!), 40),
      x,
      yFaixa + 12,
    );
    fonte(17, "bold", FUNDO).text(formatarDinheiro(valorPorDiaCent(s.mensalCent)), x, yFaixa + 25);
    fonte(8.5, "bold", FUNDO).text(t.porDia, x, yFaixa + 30);
    fonte(8, "normal", FUNDO).text(t.mensal(formatarDinheiro(s.mensalCent)), x, yFaixa + 36);
  });

  // Fundo: QR do site, o convite e a assinatura de quem gera o folheto.
  const yFundo = yFaixa + altura + 8;
  const lado = 24;
  const matriz = codigoQr(d.site);
  doc.setFillColor(255, 255, 255).rect(M, yFundo, lado, lado, "F");
  if (matriz) {
    const m = (lado - 4) / matriz.length;
    doc.setFillColor(0, 0, 0);
    matriz.forEach((linha, j) =>
      linha.forEach((escuro, i) => {
        if (escuro) doc.rect(M + 2 + i * m, yFundo + 2 + j * m, m + 0.02, m + 0.02, "F");
      }),
    );
  }
  fonte(12.5, "bold", BRANCO).text(t.cta, M + lado + 6, yFundo + 7);
  fonte(9, "normal", CINZA_CLARO).text(t.qr, M + lado + 6, yFundo + 12.5);
  fonte(10.5, "bold", DOURADO).text(d.site.replace(/^https?:\/\//, ""), M + lado + 6, yFundo + 19);
  const xContacto = 128;
  fonte(9, "bold", DOURADO).text(t.contactoTitulo, xContacto, yFundo + 2);
  desenharAssinatura(doc, xContacto, yFundo + 8.5, d.contacto, {
    nome: BRANCO,
    linhas: CINZA_CLARO,
  });

  fonte(7, "normal", CINZA_FUNDO).text(
    `${t.extra(formatarDinheiro(EXTRA_CENT.pro))} ${t.iva[d.regime]} ${t.diasNota}`,
    M,
    A - 6,
  );
  return doc;
}
