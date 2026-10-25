import { textos } from "@/lib/i18n/pt-PT";
import { criarFolha, DOURADO } from "./folha";

// PDF das Finanças para o contabilista (O.10): as mesmas secções do CSV, com a identidade da
// Performa LAB e «Não é documento fiscal» no topo e no rodapé.

const t = textos.financas.exportar;

export function gerarPdfFinancas(
  cabecalho: string[],
  seccoes: { titulo: string; linhas: Record<string, unknown>[] }[],
) {
  const f = criarFolha({ marca: textos.marca.nome, titulo: textos.financas.titulo, cor: DOURADO });
  f.subtitulo(cabecalho[0]!);
  cabecalho.slice(1).forEach((l) => f.paragrafo(l));
  for (const s of seccoes) {
    f.titulo(s.titulo);
    if (!s.linhas.length) {
      f.paragrafo(t.vazio);
      continue;
    }
    // Uma linha por registo: «coluna: valor» separados por « · », para caber em A4 ao alto.
    for (const l of s.linhas)
      f.paragrafo(
        Object.entries(l)
          .map(([k, v]) => `${k}: ${String(v ?? "")}`)
          .join(" · "),
      );
  }
  return f.fechar(t.naoFiscal, t.pagina);
}
