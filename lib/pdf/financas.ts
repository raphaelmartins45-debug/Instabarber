import { textos } from "@/lib/i18n/pt-PT";
import { criarFolha, DOURADO } from "./folha";

// PDF das Finanças para o contabilista (O.10): as mesmas secções do CSV, em tabelas, na folha
// dos documentos de gestão (D-184), com «Não é documento fiscal» no topo e no rodapé.

const t = textos.financas.exportar;

export function gerarPdfFinancas(
  cabecalho: string[],
  seccoes: { titulo: string; linhas: Record<string, unknown>[] }[],
) {
  const f = criarFolha({ titulo: textos.financas.titulo, cor: DOURADO });
  f.subtitulo(cabecalho[0]!);
  cabecalho.slice(1).forEach((l) => f.legal(l));
  for (const s of seccoes) {
    f.titulo(s.titulo);
    if (!s.linhas.length) {
      f.paragrafo(t.vazio);
      continue;
    }
    // Uma tabela por secção, com as colunas do CSV; o texto longo parte-se dentro da coluna.
    const colunas = Object.keys(s.linhas[0]!);
    f.tabela(
      colunas,
      s.linhas.map((l) => colunas.map((k) => String(l[k] ?? ""))),
    );
  }
  return f.fechar(t.naoFiscal, t.pagina);
}
