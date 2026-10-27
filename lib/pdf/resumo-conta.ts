import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { criarFolha, DOURADO } from "./folha";

// Resumo da conta de uma barbearia (D-181): o plano, o valor pela fórmula única e os pagamentos
// registados. «Não é documento fiscal» em todas as páginas (CLAUDE.md §3).

const t = textos.documentos.resumo;
const a = textos.admin;

export type DadosResumoConta = {
  barbearia: string;
  plano: string;
  periodicidade: string;
  profissionais: number;
  dominioProprio: boolean;
  descontoPct: number;
  valorCent: number;
  estado: string;
  estadoPagamento: string;
  proximoVencimento: string | null;
  recebimentos: { data: string; metodo: string; valorCent: number }[];
};

export function gerarResumoConta(d: DadosResumoConta) {
  const f = criarFolha({ marca: t.marca, titulo: t.titulo, cor: DOURADO });
  f.subtitulo(d.barbearia);
  f.titulo(t.planoTitulo);
  f.linha(t.plano, a.planos[d.plano as keyof typeof a.planos] ?? d.plano);
  f.linha(
    t.periodicidade,
    a.periodicidades[d.periodicidade as keyof typeof a.periodicidades] ?? d.periodicidade,
  );
  f.linha(t.profissionais, String(d.profissionais));
  f.linha(t.dominio, d.dominioProprio ? t.sim : t.nao);
  if (d.descontoPct > 0) f.linha(t.desconto, `${d.descontoPct} %`);
  f.linha(t.valor, formatarDinheiro(d.valorCent), true);
  f.linha(t.estado, a.estados[d.estado as keyof typeof a.estados] ?? d.estado);
  f.linha(
    t.pagamento,
    a.estadosPagamento[d.estadoPagamento as keyof typeof a.estadosPagamento] ?? d.estadoPagamento,
  );
  if (d.proximoVencimento) f.linha(t.vencimento, dataCurta(d.proximoVencimento));
  f.titulo(t.recebimentosTitulo);
  if (d.recebimentos.length)
    f.tabela(
      [...t.colunas],
      d.recebimentos.map((r) => [
        dataCurta(r.data),
        a.pagamentos.metodos[r.metodo as keyof typeof a.pagamentos.metodos] ?? r.metodo,
        formatarDinheiro(r.valorCent),
      ]),
    );
  else f.paragrafo(t.semRecebimentos);
  f.paragrafo(t.nota);
  return f.fechar(t.rodape, t.pagina);
}
