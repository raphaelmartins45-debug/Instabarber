import type { Briefing } from "@/lib/comercial/briefing";
import type { Assinatura } from "@/lib/documentos/assinatura";
import { dataCurta } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import { criarFolha, DOURADO } from "./folha";
import { capaEscura } from "./folha-capa";

// PDF da proposta (N.5): A4, papel timbrado da InstaBarber, as dez secções e «Não é documento
// fiscal» no rodapé. Gera-se da fotografia guardada em propostas.dados, por isso é sempre o
// mesmo. Assina quem a gerou, com o cargo, o WhatsApp e o e-mail (D-184).

const t = textos.comercial.pdf;
const b = textos.comercial.briefing;

export type DadosPdfProposta = {
  numero: string;
  versao: number;
  criadaEm: string;
  validaAte: string | null;
  validadeDias: number;
  plano: string;
  periodicidade: string;
  profissionais: number;
  dominioProprio: boolean;
  desafio: boolean;
  valorSemIva: string;
  valorComIva: string;
  ivaTaxa: number;
  condicoesLancamento: string | null;
  /** Desconto na mensalidade e taxa de migração sem IVA, já com o desconto (D-161). */
  descontoPct: number;
  /** Pacote de implementação (D-189): «nenhuma», «essencial» ou «formacao». */
  implementacao: string;
  taxaSemIva: string;
  dados: {
    briefing: Briefing;
    decomposicao: { rotulo: string; valorCent: number }[];
    incluidas: string[];
    solucao: { dor: string; funcionalidades: string[] }[];
    valor_para_si_cent: number | null;
    mensal_com_iva_cent: number;
    /** Quem gerou a proposta, fixado na geração (D-184); as antigas não o têm. */
    assinatura?: Assinatura;
  };
  /** Texto do modelo «condicoes_proposta» aprovado (N.8), em Markdown simples. */
  condicoes: string | null;
  /** A pessoa do lead a quem se dirige. */
  destinatario: string | null;
  assinatura: Assinatura;
};

const dinheiro = (numeric: string) => formatarDinheiro(centimosDeNumeric(numeric));

/** Linhas de texto de um Markdown simples: sem títulos, sem comentários, listas como frases. */
const linhasDoModelo = (md: string) =>
  md
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

export function gerarPdfProposta(d: DadosPdfProposta) {
  const f = criarFolha({ titulo: t.titulo, cor: DOURADO, numerar: true });
  const br = d.dados.briefing;

  // 1 · Capa escura com o logótipo, o título, os dados e quem assina
  capaEscura(f, {
    rotulo: t.titulo,
    titulo: br.nome_comercial || br.firma,
    lead: d.destinatario ? t.preparadaPara(d.destinatario) : null,
    meta: [
      [t.numero, `${d.numero} · ${textos.comercial.propostas.versao(d.versao)}`],
      [t.data, dataCurta(d.criadaEm)],
      [
        t.validade,
        d.validaAte ? dataCurta(`${d.validaAte}T12:00:00Z`) : t.validadeDias(d.validadeDias),
      ],
    ],
    assinatura: d.assinatura,
    site: t.site,
  });

  // 2 · O que ouvimos
  f.titulo(t.ouvimos);
  if (br.como_marcam.length)
    f.linha(t.comoMarcam, br.como_marcam.map((c) => b.comoMarcam[c] ?? c).join(", "));
  if (br.clientes_ativos !== undefined)
    f.linha(t.clientesAtivos, formatarNumero(br.clientes_ativos));
  if (br.valor_visita_cent) f.linha(t.valorVisita, formatarDinheiro(br.valor_visita_cent));
  if (br.faltas_semana !== undefined) f.linha(t.faltasSemana, formatarNumero(br.faltas_semana));
  if (br.objetivo) {
    f.subtituloSeccao(t.objetivo);
    f.paragrafo(br.objetivo);
  }

  // 3 · A solução, dor a dor
  f.titulo(t.solucao);
  for (const s of d.dados.solucao) {
    f.subtituloSeccao(b.dores[s.dor] ?? s.dor);
    if (s.funcionalidades.length) f.lista(s.funcionalidades);
    else f.paragrafo(t.semFuncionalidade);
  }

  // 4 · O que fica incluído
  f.titulo(t.incluido);
  f.lista(d.dados.incluidas, 2);

  // 5 · Investimento, numa só página sempre que caiba
  const linhasInvestimento = 3 + d.dados.decomposicao.length + (d.descontoPct > 0 ? 1 : 0);
  f.titulo(t.investimento, linhasInvestimento * 7.6 + 30);
  f.linha(t.plano, d.plano);
  f.linha(t.periodicidade, d.periodicidade);
  f.linha(t.profissionais, String(d.profissionais));
  for (const l of d.dados.decomposicao)
    f.linha(l.rotulo === "dominio" ? t.dominio : l.rotulo, formatarDinheiro(l.valorCent));
  if (d.descontoPct > 0) {
    const bruto = d.dados.decomposicao.reduce((s, l) => s + l.valorCent, 0);
    f.linha(
      t.desconto(d.descontoPct),
      `−${formatarDinheiro(bruto - centimosDeNumeric(d.valorSemIva))}`,
    );
  }
  if (d.ivaTaxa === 0) {
    f.total(t.total, dinheiro(d.valorComIva));
    f.legal(t.isento);
  } else {
    f.linha(t.semIva, dinheiro(d.valorSemIva));
    f.linha(
      t.iva(d.ivaTaxa),
      formatarDinheiro(centimosDeNumeric(d.valorComIva) - centimosDeNumeric(d.valorSemIva)),
    );
    f.total(t.comIva, dinheiro(d.valorComIva));
  }
  const implementacao = b.implementacoes[d.implementacao];
  if (centimosDeNumeric(d.taxaSemIva) > 0 && implementacao) {
    f.linha(t.taxaMigracao(implementacao), dinheiro(d.taxaSemIva));
    f.titulo(t.implementacao);
    f.subtituloSeccao(implementacao);
    f.lista(t.implementacaoInclui[d.implementacao] ?? []);
    f.legal(t.implementacaoNota);
  }
  if (d.dados.valor_para_si_cent) {
    f.titulo(t.valorParaSi);
    f.nota(
      t.valorParaSiTexto(
        formatarDinheiro(d.dados.valor_para_si_cent),
        formatarNumero(
          Math.round((d.dados.valor_para_si_cent / d.dados.mensal_com_iva_cent) * 10) / 10,
        ),
      ),
    );
  }

  // 6 · Desafio de 90 dias (só Pro) e 7 · Condições de lançamento
  if (d.desafio) {
    f.titulo(t.desafio);
    const [promessa, ...condicoes] = t.desafioTexto;
    f.paragrafo(promessa!);
    condicoes.forEach((c) => f.legal(c));
  }
  if (d.condicoesLancamento) {
    f.titulo(t.lancamento);
    f.paragrafo(d.condicoesLancamento);
  }

  // 8 · Como arrancamos
  f.titulo(t.arranque);
  f.passos([...t.arranquePassos]);

  // 9 · Próximo passo e assinatura de quem gerou a proposta
  f.titulo(t.proximoPasso, 60);
  f.paragrafo(t.proximoPassoTexto);
  f.assinatura(d.assinatura, t.despedida);

  // 10 · Condições (modelo aprovado), em letra pequena no fim
  f.titulo(t.condicoes);
  (d.condicoes ? linhasDoModelo(d.condicoes) : [textos.comercial.modelos.semCondicoes]).forEach(
    (l) => f.legal(l),
  );

  return f.fechar(t.rodape, t.pagina);
}
