import type { jsPDF } from "jspdf";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Preco } from "@/lib/regras/mensalidade";
import { criarFolha, DOURADO } from "./folha";

// Resumo da contratação (D.11): o dono guarda-o depois de enviar o pedido. A mesma folha dos
// documentos de gestão (D-184), paginação e «Não é documento fiscal» no rodapé. Nunca palavra-passe.

const t = textos.adesao.pdf;
const c = textos.adesao.contratacao;

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
  const f = criarFolha({ marca: textos.marca.nome, titulo: t.titulo, cor: DOURADO });
  f.subtitulo(d.contratante);
  f.meta([
    [t.data, d.data],
    [t.plano, d.plano],
    [t.periodicidade, d.periodicidade],
  ]);

  f.titulo(t.contratante);
  f.linha(textos.adesao.identidade.nome, d.contratante);
  f.linha(textos.adesao.identidade.responsavel, d.responsavel);
  f.linha(textos.adesao.identidade.nif, d.nif);

  f.titulo(t.decomposicao);
  f.linha(t.profissionais, String(d.profissionais));
  d.decomposicao.forEach((l) => f.linha(l.rotulo, formatarDinheiro(l.valorCent)));
  if (d.preco.ivaTaxa === 0) f.total(t.total, formatarDinheiro(d.preco.comIva));
  else {
    f.linha(`${t.total} (${c.semIva})`, formatarDinheiro(d.preco.semIva));
    f.total(`${t.total} (${c.comIva})`, formatarDinheiro(d.preco.comIva));
  }
  f.legal(d.textoIva);

  f.titulo(t.funcionalidades);
  f.lista(d.funcionalidades, 2);

  f.titulo(t.acessoTitulo);
  f.linha(t.acesso, d.emailAcesso);
  f.linha(t.pagamento, d.pagamento);

  return f.fechar(t.rodape, (n, total) => `${textos.marca.assinatura} · ${t.pagina(n, total)}`);
}
