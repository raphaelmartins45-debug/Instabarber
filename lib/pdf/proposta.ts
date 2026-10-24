import type { Briefing } from "@/lib/comercial/briefing";
import { dataCurta } from "@/lib/formatacao/datas";
import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import { criarFolha, DOURADO } from "./folha";

// PDF da proposta (N.5): A4, identidade da Performa LAB, dez secções, «Não é documento fiscal»
// no rodapé. Gera-se da fotografia guardada em propostas.dados, por isso é sempre o mesmo.

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
  dados: {
    briefing: Briefing;
    decomposicao: { rotulo: string; valorCent: number }[];
    incluidas: string[];
    solucao: { dor: string; funcionalidades: string[] }[];
    valor_para_si_cent: number | null;
    mensal_com_iva_cent: number;
  };
  /** Texto do modelo «condicoes_proposta» aprovado (N.8), em Markdown simples. */
  condicoes: string | null;
  contacto: { email: string; telefone: string };
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
  const f = criarFolha({ marca: t.marca, titulo: t.titulo, cor: DOURADO });
  const br = d.dados.briefing;

  // 1 · Capa
  f.subtitulo(br.nome_comercial || br.firma);
  f.linha(t.numero, `${d.numero} · ${textos.comercial.propostas.versao(d.versao)}`, true);
  f.linha(t.data, dataCurta(d.criadaEm));
  f.linha(
    t.validade,
    d.validaAte ? dataCurta(`${d.validaAte}T12:00:00Z`) : t.validadeDias(d.validadeDias),
  );
  f.linha(t.contacto, [d.contacto.email, d.contacto.telefone].filter(Boolean).join(" · "));

  // 2 · O que ouvimos
  f.titulo(t.ouvimos);
  if (br.como_marcam.length)
    f.linha(t.comoMarcam, br.como_marcam.map((c) => b.comoMarcam[c] ?? c).join(", "));
  if (br.clientes_ativos !== undefined)
    f.linha(t.clientesAtivos, formatarNumero(br.clientes_ativos));
  if (br.valor_visita_cent) f.linha(t.valorVisita, formatarDinheiro(br.valor_visita_cent));
  if (br.faltas_semana !== undefined) f.linha(t.faltasSemana, formatarNumero(br.faltas_semana));
  if (br.objetivo) f.paragrafo(`${t.objetivo}: ${br.objetivo}`);

  // 3 · A solução
  f.titulo(t.solucao);
  for (const s of d.dados.solucao)
    f.paragrafo(
      `${b.dores[s.dor] ?? s.dor}: ${s.funcionalidades.length ? s.funcionalidades.join(", ") : t.semFuncionalidade}`,
    );

  // 4 · O que fica incluído
  f.titulo(t.incluido);
  f.paragrafo(d.dados.incluidas.join(" · "));

  // 5 · Investimento
  f.titulo(t.investimento);
  f.linha(t.plano, d.plano);
  f.linha(t.periodicidade, d.periodicidade);
  f.linha(t.profissionais, String(d.profissionais));
  for (const l of d.dados.decomposicao)
    f.linha(l.rotulo === "dominio" ? t.dominio : l.rotulo, formatarDinheiro(l.valorCent));
  f.linha(t.semIva, dinheiro(d.valorSemIva));
  f.linha(t.comIva, dinheiro(d.valorComIva), true);
  f.paragrafo(
    d.ivaTaxa === 0
      ? t.isento
      : t.ivaIncluido(
          formatarDinheiro(centimosDeNumeric(d.valorComIva) - centimosDeNumeric(d.valorSemIva)),
        ),
  );
  if (d.dados.valor_para_si_cent) {
    f.titulo(t.valorParaSi);
    f.paragrafo(
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
    t.desafioTexto.forEach((p) => f.paragrafo(p));
  }
  if (d.condicoesLancamento) {
    f.titulo(t.lancamento);
    f.paragrafo(d.condicoesLancamento);
  }

  // 8 · Como arrancamos
  f.titulo(t.arranque);
  t.arranquePassos.forEach((p, i) => f.paragrafo(`${i + 1}. ${p}`));

  // 9 · Condições (modelo aprovado)
  f.titulo(t.condicoes);
  (d.condicoes ? linhasDoModelo(d.condicoes) : [textos.comercial.modelos.semCondicoes]).forEach(
    (l) => f.paragrafo(l),
  );

  // 10 · Próximo passo e assinatura
  f.titulo(t.proximoPasso);
  f.paragrafo(t.proximoPassoTexto);
  f.paragrafo(t.assinatura);

  return f.fechar(t.rodape, t.pagina);
}
