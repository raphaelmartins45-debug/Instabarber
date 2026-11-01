import type { jsPDF } from "jspdf";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { corDoTexto } from "@/lib/regras/contraste";
import {
  CINZA,
  CINZA_ESCURO,
  corDeHex,
  criarDocumento,
  LINHA_FORTE,
  rotuloEspacado,
  TINTA,
  LETRA,
} from "./estilo";

// Cartão oferta em PDF (F.4.9): com a marca da barbearia (a cor da capa) e «Não é documento
// fiscal». O cartão é registado, não cobrado: a venda foi paga ao balcão. O texto da faixa escolhe
// preto ou branco pelo contraste com a cor; o código vai numa caixa, fácil de ler ao balcão.

const t = textos.sistema.pdfCartao;

export type DadosCartao = {
  barbearia: string;
  corCapa: string;
  codigo: string;
  valorCent: number;
  comprador: string;
  beneficiario: string | null;
  validoAte: string;
};

export function gerarCartaoOferta(d: DadosCartao): jsPDF {
  // Formato de cartão grande (A6 deitado).
  const doc = criarDocumento({ formato: "a6", orientacao: "landscape" });
  const L = doc.internal.pageSize.getWidth();
  const A = doc.internal.pageSize.getHeight();
  const M = 10;
  const cor = /^#[0-9a-f]{6}$/i.test(d.corCapa) ? d.corCapa : "#12100E";
  doc.setFillColor(...corDeHex(cor)).rect(0, 0, L, 28, "F");
  const sobre = corDeHex(corDoTexto(cor));
  doc
    .setTextColor(...sobre)
    .setFont(LETRA, "bold")
    .setFontSize(15)
    .text(d.barbearia, M, 13);
  doc.setFont(LETRA, "normal").setFontSize(10).text(t.titulo, M, 20.5);

  doc
    .setTextColor(...TINTA)
    .setFont(LETRA, "bold")
    .setFontSize(26);
  doc.text(formatarDinheiro(d.valorCent), M, 45);
  doc
    .setFont(LETRA, "normal")
    .setFontSize(9.5)
    .setTextColor(...CINZA_ESCURO);
  const pessoas = [d.beneficiario ? t.para(d.beneficiario) : null, t.de(d.comprador)].filter(
    (l): l is string => !!l,
  );
  doc.text(pessoas, M, 52);

  // O código numa caixa, com espaço entre os caracteres.
  const yCodigo = 52 + pessoas.length * 4.6 + 4;
  doc
    .setDrawColor(...LINHA_FORTE)
    .setLineWidth(0.3)
    .roundedRect(M, yCodigo, L - 2 * M, 13, 1.5, 1.5, "S");
  doc
    .setFont(LETRA, "bold")
    .setFontSize(7)
    .setTextColor(...CINZA);
  rotuloEspacado(doc, t.codigo, M + 4, yCodigo + 5);
  doc
    .setFontSize(14)
    .setTextColor(...TINTA)
    .text(d.codigo, M + 4, yCodigo + 10.5, { charSpace: 0.8 });
  doc
    .setFont(LETRA, "normal")
    .setFontSize(8.5)
    .setTextColor(...CINZA_ESCURO)
    .text(t.validade(d.validoAte), L - M - 4, yCodigo + 10.5, { align: "right" });

  doc.setFontSize(8).setTextColor(...CINZA);
  doc.text(doc.splitTextToSize(t.uso, L - 2 * M) as string[], M, yCodigo + 20);
  doc.setFont(LETRA, "bold").text(t.fiscal, M, A - 6);
  return doc;
}
