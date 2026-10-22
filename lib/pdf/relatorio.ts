import { formatarDinheiro as d } from "@/lib/formatacao/dinheiro";
import { mesPorExtenso, nomeDoMes } from "@/lib/formatacao/datas";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import type { RelatorioMes } from "@/lib/painel/relatorio-tipos";
import {
  nomeDia,
  percentagem,
  textoRecomendacao,
  textoVariacao,
} from "@/lib/painel/relatorio-textos";
import { slugDoNome } from "@/lib/regras/slug";
import { corDeHex, criarFolha } from "./folha";

// O PDF do relatório mensal (E.5): um só gerador para as duas camadas. No painel do barbeiro, o
// título identifica-o e o documento não leva o financeiro da barbearia.

const t = textos.relatorio;

export function nomeFicheiroRelatorio(mes: string, nome: string): string {
  const [ano] = mes.split("-");
  return `Relatorio-${slugDoNome(nomeDoMes(mes))}-${ano}-${slugDoNome(nome)}.pdf`.replace(
    /(^|-)([a-z])/g,
    (_, a: string, b: string) => `${a}${b.toUpperCase()}`,
  );
}

export function gerarRelatorioPdf(
  r: RelatorioMes,
  o: { barbearia: string; titulo: string; cor: string; mensagens: boolean },
): ArrayBuffer {
  const f = criarFolha({ marca: t.pdf.marca, titulo: t.pdf.de(o.titulo), cor: corDeHex(o.cor) });
  f.subtitulo(`${o.barbearia} · ${mesPorExtenso(r.mes)}`);
  let n = 0;
  const bloco = (nome: string) => f.titulo(`${++n}. ${nome}`);

  bloco(t.blocos.resumo);
  f.linha(t.resumo.faturacao, d(r.resumo.faturacaoCent), true);
  f.linha("", textoVariacao(r.resumo.variacao));
  if (r.financeiro) {
    f.linha(t.resumo.resultado, d(r.financeiro.resultadoCent));
    f.linha(t.resumo.margem, percentagem(r.financeiro.margem));
  }
  f.linha(t.resumo.atendidos, String(r.resumo.atendidos));
  f.linha(t.resumo.perdidos, String(r.resumo.perdidos));
  f.linha(t.resumo.recuperados, String(r.resumo.recuperados));

  bloco(t.blocos.evolucao);
  f.barras(
    r.evolucao.map((m) => ({
      rotulo: nomeDoMes(m.mes).slice(0, 3),
      valor: m.faturacaoCent,
      destaque: m.mes === r.mes,
    })),
  );

  const c = t.colunas;
  bloco(r.profissionalId ? t.blocos.meuDesempenho : t.blocos.desempenho);
  f.tabela(
    [c.profissional, c.faturacao, c.servicos, c.ticket, c.objetivo, c.comissao],
    r.desempenho.map((l) => [
      l.nome,
      d(l.faturacaoCent),
      String(l.servicos),
      d(l.ticketCent),
      percentagem(l.objetivoPercent),
      d(l.comissaoCent),
    ]),
  );

  bloco(t.blocos.servicos);
  f.tabela(
    [c.servico, c.quantidade, c.receita, c.peso],
    r.servicos.map((s) => [
      s.nome,
      String(s.quantidade),
      d(s.receitaCent),
      `${formatarNumero(s.peso)} %`,
    ]),
  );

  const x = r.retencao;
  bloco(t.blocos.retencao);
  f.linha(t.retencao.recuperados, String(x.recuperados));
  f.linha(t.retencao.ligacoes, String(x.ligacoesAbertas));
  f.linha(t.retencao.novos, String(x.novos));
  f.linha(t.retencao.ativos, String(x.ativos));
  f.linha(t.retencao.emRisco, String(x.emRisco));
  if (o.mensagens) {
    f.paragrafo(
      `${t.retencao.pagouTitulo}. ${t.retencao.recuperou(d(x.recuperadaCent))} ${t.retencao.custou(d(x.subscricaoCent))}`,
    );
  } else f.paragrafo(t.retencao.sozinhos(x.voltaramSozinhos));

  bloco(t.blocos.fidelizacao);
  f.linha(t.fidelizacao.selos, String(r.fidelizacao.selosAtribuidos));
  f.linha(t.fidelizacao.cartoes, String(r.fidelizacao.cartoesCompletos));
  f.linha(t.fidelizacao.premios, String(r.fidelizacao.premiosResgatados));
  f.linha(t.fidelizacao.convites, String(r.fidelizacao.convites));

  const fin = r.financeiro;
  if (fin) {
    const tf = t.financeiro;
    bloco(t.blocos.financeiro);
    f.linha(tf.receitaPropria, d(fin.receitaPropriaCent));
    f.linha(tf.rendas, d(fin.rendasCent));
    f.linha(tf.parteCasa, d(fin.parteCasaCent));
    f.linha(tf.comissoes, d(fin.comissoesCent));
    if (fin.clube) {
      f.linha(tf.mensalidades, d(fin.clube.mensalidadesCent));
      f.linha(tf.subscritores, String(fin.clube.subscritores));
      f.linha(tf.creditos, String(fin.clube.creditosPorUsar));
    }
    if (fin.loja) {
      f.linha(tf.lojaReceita, d(fin.loja.receitaSemIvaCent));
      f.linha(tf.lojaCusto, d(fin.loja.custoCent));
      f.linha(tf.lojaMargem, d(fin.loja.margemCent));
      f.linha(tf.abaixoMinimo, String(fin.loja.abaixoMinimo));
    }
    f.linha(tf.receita, d(fin.receitaCent), true);
    f.linha(tf.custos, d(fin.custosCent));
    f.linha(tf.despesas, d(fin.despesasCent));
    f.linha(tf.resultado, d(fin.resultadoCent), true);
    f.linha(tf.margem, percentagem(fin.margem));
  }

  const op = r.operacao;
  bloco(t.blocos.operacao);
  f.linha(t.operacao.faltas, percentagem(op.taxaFaltas));
  f.linha(t.operacao.ocupacao, percentagem(op.ocupacao));
  f.linha(t.operacao.melhorDia, nomeDia(op.melhorDia));
  f.linha(t.operacao.piorDia, nomeDia(op.piorDia));
  f.linha(
    t.operacao.antecedencia,
    op.antecedencia === null ? t.vazio : t.operacao.dias(formatarNumero(op.antecedencia)),
  );

  bloco(t.blocos.recomendacoes);
  if (r.recomendacoes.length)
    r.recomendacoes.forEach((rec, i) => f.paragrafo(`${i + 1}. ${textoRecomendacao(rec)}`));
  else f.paragrafo(t.recomendacoes.vazio);

  return f.fechar(t.rodape, t.pdf.pagina).output("arraybuffer");
}
