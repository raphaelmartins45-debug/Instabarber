import { centimosDeNumeric, formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { criarFolha, DOURADO } from "./folha";

// PDF do contrato (N.6): o texto fixado na geração (modelo aprovado com os marcadores já
// substituídos) e, no fim, o Anexo I com a fotografia da proposta aceite. Os anexos II a IV
// são referidos no próprio texto do modelo.

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

/** Markdown simples do modelo: títulos, parágrafos e listas, sem ênfase nem comentários. */
export function blocosDoTexto(md: string) {
  return md
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && l !== "---")
    .map((l) => {
      const limpo = l.replace(/\*\*|__|`/g, "").replace(/(^|\s)\*([^*]+)\*/g, "$1$2");
      if (limpo.startsWith("## ")) return { tipo: "titulo" as const, texto: limpo.slice(3) };
      if (limpo.startsWith("# ")) return { tipo: "subtitulo" as const, texto: limpo.slice(2) };
      if (limpo.startsWith("#"))
        return { tipo: "titulo" as const, texto: limpo.replace(/^#+\s*/, "") };
      return { tipo: "paragrafo" as const, texto: limpo.replace(/^[-*]\s+/, "• ") };
    });
}

export function gerarPdfContrato(d: DadosPdfContrato) {
  const f = criarFolha({ marca: p.marca, titulo: t.titulo, cor: DOURADO });
  for (const b of blocosDoTexto(d.texto)) f[b.tipo](b.texto);

  const pr = d.proposta;
  f.titulo(t.anexoI(pr.numero));
  f.paragrafo(t.anexoIAjuda);
  f.linha(p.plano, pr.plano);
  f.linha(p.periodicidade, pr.periodicidade);
  f.linha(p.profissionais, String(pr.profissionais));
  for (const l of pr.decomposicao)
    f.linha(l.rotulo === "dominio" ? p.dominio : l.rotulo, formatarDinheiro(l.valorCent));
  f.linha(p.semIva, formatarDinheiro(centimosDeNumeric(pr.valorSemIva)));
  f.linha(p.comIva, formatarDinheiro(centimosDeNumeric(pr.valorComIva)), true);
  if (pr.incluidas.length) {
    f.titulo(p.incluido);
    f.paragrafo(pr.incluidas.join(" · "));
  }
  return f.fechar(t.rodape, p.pagina);
}
