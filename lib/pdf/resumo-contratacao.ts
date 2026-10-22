import { jsPDF } from "jspdf";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Preco } from "@/lib/regras/mensalidade";

// Resumo da contratação (D.11): o dono guarda-o depois de enviar o pedido. Identidade da marca
// (cabeçalho escuro, dourado), paginação e «Não é documento fiscal» no rodapé. Nunca palavra-passe.

const t = textos.adesao.pdf;
const PRETO: [number, number, number] = [0x12, 0x10, 0x0e];
const DOURADO: [number, number, number] = [0xf5, 0xa6, 0x23];
const CINZA: [number, number, number] = [0x8a, 0x84, 0x7c];

export type DadosResumo = {
  contratante: string;
  responsavel: string;
  nif: string;
  plano: string;
  periodicidade: string;
  profissionais: number;
  decomposicao: { rotulo: string; valorCent: number }[];
  preco: Preco;
  textoIva: string;
  funcionalidades: string[];
  emailAcesso: string;
  pagamento: string;
  data: string;
};

export function gerarResumoContratacao(d: DadosResumo): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 18;
  let y = 0;

  const cabecalho = () => {
    doc.setFillColor(...PRETO).rect(0, 0, largura, 26, "F");
    doc
      .setTextColor(...DOURADO)
      .setFont("helvetica", "bold")
      .setFontSize(18)
      .text(textos.marca.nome, margem, 16);
    doc
      .setTextColor(255, 255, 255)
      .setFont("helvetica", "normal")
      .setFontSize(10)
      .text(t.titulo, largura - margem, 16, { align: "right" });
    y = 38;
  };
  const garantirEspaco = (mm: number) => {
    if (y + mm > altura - 24) {
      doc.addPage();
      cabecalho();
    }
  };
  const titulo = (texto: string) => {
    garantirEspaco(12);
    doc
      .setTextColor(0xc9, 0x82, 0x1a)
      .setFont("helvetica", "bold")
      .setFontSize(11)
      .text(texto, margem, y);
    y += 6;
  };
  const linha = (rotulo: string, valor: string) => {
    garantirEspaco(7);
    doc
      .setTextColor(...CINZA)
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .text(rotulo, margem, y);
    doc
      .setTextColor(...PRETO)
      .setFontSize(10)
      .text(valor, largura - margem, y, { align: "right" });
    y += 6;
  };

  cabecalho();
  titulo(t.contratante);
  linha(textos.adesao.identidade.nome, d.contratante);
  linha(textos.adesao.identidade.responsavel, d.responsavel);
  linha(textos.adesao.identidade.nif, d.nif);
  y += 3;
  titulo(t.plano);
  linha(t.plano, d.plano);
  linha(t.periodicidade, d.periodicidade);
  linha(t.profissionais, String(d.profissionais));
  y += 3;
  titulo(t.decomposicao);
  d.decomposicao.forEach((l) => linha(l.rotulo, formatarDinheiro(l.valorCent)));
  linha(`${t.total} (${textos.adesao.contratacao.semIva})`, formatarDinheiro(d.preco.semIva));
  linha(`${t.total} (${textos.adesao.contratacao.comIva})`, formatarDinheiro(d.preco.comIva));
  garantirEspaco(7);
  doc
    .setTextColor(...CINZA)
    .setFontSize(8)
    .text(d.textoIva, margem, y);
  y += 8;
  titulo(t.funcionalidades);
  doc.setFontSize(9).setTextColor(...PRETO);
  d.funcionalidades.forEach((f) => {
    garantirEspaco(5);
    doc.text(`•  ${f}`, margem + 2, y);
    y += 5;
  });
  y += 3;
  titulo(t.acesso);
  linha(t.acesso, d.emailAcesso);
  linha(t.pagamento, d.pagamento);
  linha(t.data, d.data);

  const total = doc.getNumberOfPages();
  for (let n = 1; n <= total; n++) {
    doc.setPage(n);
    doc.setDrawColor(...DOURADO).line(margem, altura - 18, largura - margem, altura - 18);
    doc
      .setTextColor(...CINZA)
      .setFont("helvetica", "normal")
      .setFontSize(8);
    doc.text(t.rodape, margem, altura - 12);
    doc.text(`${textos.marca.assinatura} · ${t.pagina(n, total)}`, largura - margem, altura - 7, {
      align: "right",
    });
  }
  return doc;
}
