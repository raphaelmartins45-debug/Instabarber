import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { CINZA_ESCURO, LINHA_FORTE } from "./estilo";
import { criarFolha, DOURADO, type Folha } from "./folha";

// PDF do contrato (N.6): o texto fixado na geração (modelo aprovado com os marcadores já
// substituídos) e, numa página própria, o Anexo I com a fotografia da proposta aceite. Os anexos
// II a IV são referidos no próprio texto do modelo. As tabelas do Markdown desenham-se como
// tabelas, e a das assinaturas como espaços para assinar com o nome por baixo (D-184).

const t = textos.comercial.contratos.pdf;
const p = textos.comercial.pdf;

export type DadosPdfContrato = {
  texto: string;
  proposta: {
    numero: string;
    plano: string;
    periodicidade: string;
    profissionais: number;
    valorSemIva: string;
    valorComIva: string;
    decomposicao: { rotulo: string; valorCent: number }[];
    incluidas: string[];
  };
};

type Bloco =
  | { tipo: "titulo" | "subtitulo" | "paragrafo"; texto: string }
  | { tipo: "tabela"; linhas: string[][] };

const celulas = (linha: string) =>
  linha
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
const SEPARADOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;
const TRACO = /^_{3,}$/;

/** Markdown simples do modelo: títulos, parágrafos, listas e tabelas, sem ênfase nem notas. */
export function blocosDoTexto(md: string): Bloco[] {
  const blocos: Bloco[] = [];
  const linhas = md
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && l !== "---");
  for (const l of linhas) {
    if (l.startsWith("|")) {
      // Nas tabelas, os traços «____» são o espaço para assinar: só se tira a ênfase a negrito.
      if (SEPARADOR.test(l)) continue;
      const linha = celulas(l.replace(/\*\*|`/g, ""));
      const anterior = blocos.at(-1);
      if (anterior?.tipo === "tabela") anterior.linhas.push(linha);
      else blocos.push({ tipo: "tabela", linhas: [linha] });
      continue;
    }
    const limpo = l.replace(/\*\*|__|`/g, "").replace(/(^|\s)\*([^*]+)\*/g, "$1$2");
    if (limpo.startsWith("## ")) blocos.push({ tipo: "titulo", texto: limpo.slice(3) });
    else if (limpo.startsWith("# ")) blocos.push({ tipo: "subtitulo", texto: limpo.slice(2) });
    else if (limpo.startsWith("#"))
      blocos.push({ tipo: "titulo", texto: limpo.replace(/^#+\s*/, "") });
    else blocos.push({ tipo: "paragrafo", texto: limpo.replace(/^[-*]\s+/, "• ") });
  }
  return blocos;
}

/** A tabela das assinaturas: a parte a negrito, o espaço para assinar e o nome por baixo. */
function assinaturas(f: Folha, linhas: string[][]) {
  const [cabeca = [], ...resto] = linhas;
  const nomes = resto.filter((l) => !l.every((c) => !c || TRACO.test(c)));
  const n = cabeca.length || 1;
  const g = 12;
  const w = (f.util - g * (n - 1)) / n;
  f.espaco(44);
  f.y += 6;
  cabeca.forEach((c, i) => f.fonte(10, "bold").text(c, f.M + i * (w + g), f.y));
  f.y += 22;
  for (let i = 0; i < n; i++)
    f.doc
      .setDrawColor(...LINHA_FORTE)
      .setLineWidth(0.3)
      .line(f.M + i * (w + g), f.y, f.M + i * (w + g) + w, f.y);
  f.y += 5;
  for (const linha of nomes) {
    linha.forEach((c, i) =>
      f.fonte(9.5, "normal", CINZA_ESCURO).text(f.quebrar(c, w), f.M + i * (w + g), f.y),
    );
    f.y += 5;
  }
  f.y += 4;
}

export function gerarPdfContrato(d: DadosPdfContrato) {
  const f = criarFolha({ marca: p.marca, titulo: t.titulo, cor: DOURADO });
  for (const b of blocosDoTexto(d.texto)) {
    if (b.tipo === "tabela") {
      if (b.linhas.some((l) => l.some((c) => TRACO.test(c)))) assinaturas(f, b.linhas);
      else f.tabela(b.linhas[0]!, b.linhas.slice(1));
    } else if (b.tipo === "paragrafo") {
      if (b.texto.startsWith("• ")) f.lista([b.texto.slice(2)]);
      else f.paragrafo(b.texto, undefined, 9.5);
    } else f[b.tipo](b.texto);
  }

  const pr = d.proposta;
  f.novaPagina();
  f.sobretitulo(t.anexo);
  f.subtitulo(t.anexoI(pr.numero));
  f.legal(t.anexoIAjuda);
  f.titulo(p.investimento);
  f.linha(p.plano, pr.plano);
  f.linha(p.periodicidade, pr.periodicidade);
  f.linha(p.profissionais, String(pr.profissionais));
  for (const l of pr.decomposicao)
    f.linha(l.rotulo === "dominio" ? p.dominio : l.rotulo, formatarDinheiro(l.valorCent));
  const sem = formatarDinheiro(centimosDeNumeric(pr.valorSemIva));
  const com = formatarDinheiro(centimosDeNumeric(pr.valorComIva));
  if (sem === com) f.total(p.total, com);
  else {
    f.linha(p.semIva, sem);
    f.total(p.comIva, com);
  }
  if (pr.incluidas.length) {
    f.titulo(p.incluido);
    f.lista(pr.incluidas, 2);
  }
  return f.fechar(t.rodape, p.pagina);
}
