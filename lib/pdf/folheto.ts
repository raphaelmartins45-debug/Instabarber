import { jsPDF } from "jspdf";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarTelefone } from "@/lib/formatacao/telefone";
import { textos } from "@/lib/i18n/pt-PT";
import { EXTRA_CENT, type RegimeIva } from "@/lib/regras/mensalidade";
import { codigoQr } from "@/lib/regras/qr";
import { simularPreco } from "@/lib/regras/vendas";
import { DOURADO } from "./folha";
import { FUNDO, OURO_TEXTO } from "./guia-primitivas";

// Folheto da visita (D-181): uma página A4 com a promessa, o que o sistema faz, os preços pela
// fórmula única, o QR do site e os contactos de quem o gera (nome, telefone e e-mail do registo).

const t = textos.documentos.folheto;
const CINZA: [number, number, number] = [0x52, 0x52, 0x5b];

export function gerarFolheto(d: {
  regime: RegimeIva;
  site: string;
  contacto: { nome: string; funcao: string; telefone: string | null; email: string | null };
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
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
  fonte(14, "bold", DOURADO).text(t.marca, M, 18);
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
  fonte(13, "bold", OURO_TEXTO).text(t.precosTitulo, M, y);
  y += 8;
  (["basic", "pro"] as const).forEach((plano, i) => {
    const s = simularPreco(plano, 0, false, d.regime);
    const x = M + i * (largura + 8);
    doc.setDrawColor(0xe4, 0xe4, 0xe7).setLineWidth(0.3).roundedRect(x, y, largura, 30, 3, 3, "S");
    fonte(10, "bold", FUNDO).text(
      t.plano(textos.vendas.simulador.planos[plano], t.barbeiros[plano]!),
      x + 5,
      y + 8,
    );
    const preco = formatarDinheiro(s.mensalCent);
    fonte(20, "bold", FUNDO).text(preco, x + 5, y + 19);
    const larguraPreco = doc.getTextWidth(preco);
    fonte(9, "normal", CINZA).text(t.porMes, x + 7 + larguraPreco, y + 19);
    fonte(8.5, "normal", CINZA).text(t.anual(formatarDinheiro(s.anualCent)), x + 5, y + 26);
  });
  y += 37;
  fonte(9, "normal", CINZA).text(
    `${t.extra(formatarDinheiro(EXTRA_CENT.pro))} ${t.iva[d.regime]}`,
    M,
    y,
  );
  y += 12;

  // QR do site e os contactos de quem gera o folheto.
  const lado = 44;
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
  fonte(13, "bold", FUNDO).text(t.cta, M + lado + 8, y + 8);
  fonte(10, "normal", CINZA).text(t.qr, M + lado + 8, y + 14);
  fonte(11, "bold", OURO_TEXTO).text(d.site.replace(/^https?:\/\//, ""), M + lado + 8, y + 21);

  const xc = L / 2 + 14;
  doc.setFillColor(0xff, 0xf8, 0xec).roundedRect(xc, y - 2, L - M - xc, lado + 2, 3, 3, "F");
  fonte(9, "bold", OURO_TEXTO).text(t.contactoTitulo.toUpperCase(), xc + 5, y + 6);
  fonte(13, "bold", FUNDO).text(d.contacto.nome, xc + 5, y + 14);
  fonte(9.5, "normal", CINZA).text(d.contacto.funcao, xc + 5, y + 20);
  const linhas = [
    d.contacto.telefone ? formatarTelefone(d.contacto.telefone) : null,
    d.contacto.email,
  ].filter((l): l is string => !!l);
  linhas.forEach((l, i) => fonte(11, "bold", FUNDO).text(l, xc + 5, y + 29 + i * 6.5));

  fonte(8.5, "normal", CINZA).text(t.rodape, L / 2, A - 10, { align: "center" });
  return doc;
}
