import type { Assinatura } from "@/lib/documentos/assinatura";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { criarFolha, DOURADO } from "./folha";

// Resumo da conta de uma barbearia (D-181): o plano, o valor pela fórmula única e os pagamentos
// registados. «Não é documento fiscal» em todas as páginas (CLAUDE.md §3). Assina o Apoio ao
// cliente, a quem se pergunta sobre a conta (D-184).

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
  assinatura: Assinatura;
};

export function gerarResumoConta(d: DadosResumoConta) {
  const f = criarFolha({ titulo: t.titulo, cor: DOURADO });
  f.subtitulo(d.barbearia);
  f.y += 4;
  // O que a barbearia quer saber primeiro: quanto paga, e até quando está em dia.
  f.destaque(t.valor, formatarDinheiro(d.valorCent), [
    [
      t.pagamento,
      a.estadosPagamento[d.estadoPagamento as keyof typeof a.estadosPagamento] ?? d.estadoPagamento,
    ],
    ...(d.proximoVencimento
      ? [[t.vencimento, dataCurta(d.proximoVencimento)] as [string, string]]
      : []),
  ]);
  f.titulo(t.planoTitulo);
  f.grelha([
    [t.plano, a.planos[d.plano as keyof typeof a.planos] ?? d.plano],
    [
      t.periodicidade,
      a.periodicidades[d.periodicidade as keyof typeof a.periodicidades] ?? d.periodicidade,
    ],
    [t.profissionais, String(d.profissionais)],
    [t.dominio, d.dominioProprio ? t.sim : t.nao],
    [t.estado, a.estados[d.estado as keyof typeof a.estados] ?? d.estado],
    ...(d.descontoPct > 0 ? [[t.desconto, `${d.descontoPct} %`] as [string, string]] : []),
  ]);
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
  f.legal(t.nota);
  f.assinatura(d.assinatura);
  return f.fechar(t.rodape, t.pagina);
}
