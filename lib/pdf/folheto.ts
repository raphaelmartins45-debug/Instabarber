import type { Assinatura } from "@/lib/documentos/assinatura";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { EXTRA_CENT, type RegimeIva } from "@/lib/regras/mensalidade";
import { codigoQr } from "@/lib/regras/qr";
import { simularPreco, valorPorDiaCent } from "@/lib/regras/vendas";
import { LOGO_DOURADO } from "./logos-marca";
import {
  AMARELO_CLARO,
  CINZA_ESCURO as CINZA,
  criarDocumento,
  DOURADO,
  desenharAssinatura,
  desenharLogo,
  FUNDO,
  OURO_TEXTO,
  rotuloEspacado,
} from "./estilo";

// Folheto da visita (D-181): uma página A4 com a promessa, o que o sistema faz, os preços pela
// fórmula única, o QR do site e a assinatura de quem o gera: o nome, o cargo, o WhatsApp e o
// e-mail do registo (D-184).

const t = textos.documentos.folheto;

export function gerarFolheto(d: { regime: RegimeIva; site: string; contacto: Assinatura }) {
  const doc = criarDocumento();
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const M = 16;
  const fonte = (n: number, peso: "normal" | "bold", cor: [number, number, number]) =>
    doc
      .setFont("helvetica", peso)
      .setFontSize(n)
      .setTextColor(...cor);

  // Cabeça escura com a marca e a promessa.
  doc.setFillColor(...FUNDO).rect(0, 0, L, 74, "F");
  desenharLogo(doc, LOGO_DOURADO, M, 11, 12);
  fonte(23, "bold", [0xf4, 0xf4, 0xf5]);
  const titulo = doc.splitTextToSize(t.titulo, L - 2 * M) as string[];
  doc.text(titulo, M, 36);
  fonte(12, "normal", [0xa1, 0xa1, 0xaa]).text(t.subtitulo, M, 38 + titulo.length * 9.5);
  doc.setFillColor(...DOURADO).rect(0, 74, L, 1.6, "F");

  // O que faz: duas colunas de três.
  let y = 90;
  const largura = (L - 2 * M - 8) / 2;
  t.funcionalidades.forEach(([titulo, texto], i) => {
    const x = M + (i % 2) * (largura + 8);
    const yy = y + Math.floor(i / 2) * 22;
    doc.setFillColor(...DOURADO).circle(x + 1.5, yy - 1.4, 1.5, "F");
    fonte(11.5, "bold", FUNDO).text(titulo, x + 6, yy);
    fonte(9.5, "normal", CINZA).text(
      doc.splitTextToSize(texto, largura - 6) as string[],
      x + 6,
      yy + 5,
    );
  });
  y += 3 * 22 + 6;

  // Preços pela fórmula única.
  fonte(13, "bold", FUNDO).text(t.precosTitulo, M, y);
  y += 8;
  (["basic", "pro"] as const).forEach((plano, i) => {
    const s = simularPreco(plano, 0, false, d.regime);
    const x = M + i * (largura + 8);
    // O valor por dia em destaque, que é o que fica na cabeça; o mensal e o anual por baixo.
    const destaque = plano === "pro";
    doc
      .setFillColor(...(destaque ? FUNDO : AMARELO_CLARO))
      .roundedRect(x, y, largura, 40, 2, 2, "F");
    fonte(10, "bold", destaque ? DOURADO : FUNDO).text(
      t.plano(textos.vendas.simulador.planos[plano], t.barbeiros[plano]!),
      x + 6,
      y + 9,
    );
    const dia = formatarDinheiro(valorPorDiaCent(s.mensalCent));
    fonte(30, "bold", destaque ? DOURADO : FUNDO).text(dia, x + 6, y + 23);
    fonte(11, "bold", destaque ? [0xf4, 0xf4, 0xf5] : FUNDO).text(
      t.porDia,
      x + 8 + doc.setFontSize(30).getTextWidth(dia),
      y + 23,
    );
    fonte(9, "normal", destaque ? [0xa1, 0xa1, 0xaa] : CINZA).text(
      [t.mensal(formatarDinheiro(s.mensalCent)), t.anual(formatarDinheiro(s.anualCent))],
      x + 6,
      y + 30,
    );
  });
  y += 47;
  fonte(9, "normal", CINZA).text(
    `${t.extra(formatarDinheiro(EXTRA_CENT.pro))} ${t.iva[d.regime]}`,
    M,
    y,
  );
  y += 12;

  // QR do site e a assinatura de quem gera o folheto.
  const lado = 40;
  const matriz = codigoQr(d.site);
  if (matriz) {
    const m = lado / matriz.length;
    doc.setFillColor(0, 0, 0);
    matriz.forEach((linha, j) =>
      linha.forEach((escuro, i) => {
        if (escuro) doc.rect(M + i * m, y + j * m, m + 0.02, m + 0.02, "F");
      }),
    );
  }
  const xt = M + lado + 6;
  const xc = L / 2 + 4;
  fonte(12.5, "bold", FUNDO).text(t.cta, xt, y + 8);
  fonte(9.5, "normal", CINZA).text(doc.splitTextToSize(t.qr, xc - xt - 6) as string[], xt, y + 14);
  fonte(10.5, "bold", OURO_TEXTO).text(d.site.replace(/^https?:\/\//, ""), xt, y + 26);

  doc.setFillColor(...AMARELO_CLARO).roundedRect(xc, y - 2, L - M - xc, lado + 2, 2, 2, "F");
  fonte(7.5, "bold", OURO_TEXTO);
  rotuloEspacado(doc, t.contactoTitulo, xc + 6, y + 6);
  desenharAssinatura(doc, xc + 6, y + 15, d.contacto);

  fonte(8.5, "normal", CINZA).text(t.rodape, L / 2, A - 10, { align: "center" });
  return doc;
}
