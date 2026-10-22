import { jsPDF } from "jspdf";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";

// Cartão oferta em PDF (F.4.9): com a marca da barbearia (a cor da capa) e «Não é documento fiscal».
// O cartão é registado, não cobrado: a venda foi paga ao balcão.

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

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

export function gerarCartaoOferta(d: DadosCartao): jsPDF {
  // Formato de cartão grande (A6 deitado).
  const doc = new jsPDF({ unit: "mm", format: "a6", orientation: "landscape" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  doc.setFillColor(...rgb(d.corCapa)).rect(0, 0, largura, 30, "F");
  doc
    .setTextColor(255, 255, 255)
    .setFont("helvetica", "bold")
    .setFontSize(16)
    .text(d.barbearia, 10, 14);
  doc.setFont("helvetica", "normal").setFontSize(11).text(t.titulo, 10, 22);
  doc
    .setTextColor(18, 16, 14)
    .setFont("helvetica", "bold")
    .setFontSize(28)
    .text(formatarDinheiro(d.valorCent), 10, 48);
  doc.setFontSize(10).setFont("helvetica", "normal");
  if (d.beneficiario) doc.text(t.para(d.beneficiario), 10, 56);
  doc.text(t.de(d.comprador), 10, d.beneficiario ? 62 : 56);
  doc.setFont("courier", "bold").setFontSize(18).text(`${t.codigo}: ${d.codigo}`, 10, 76);
  doc.setFont("helvetica", "normal").setFontSize(9).text(t.validade(d.validoAte), 10, 84);
  doc.setTextColor(138, 132, 124).text(doc.splitTextToSize(t.uso, largura - 20), 10, 90);
  doc.setFont("helvetica", "bold").text(t.fiscal, 10, altura - 6);
  return doc;
}
