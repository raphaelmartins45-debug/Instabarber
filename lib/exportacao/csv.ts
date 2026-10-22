// CSV para a exportação de dados (E.1): separador «;» (o Excel português abre-o diretamente),
// BOM UTF-8, aspas quando é preciso. Objetos e listas saem em JSON.

const celula = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const texto = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

export function paraCsv(linhas: Record<string, unknown>[]): string {
  if (linhas.length === 0) return "\uFEFF";
  const colunas = Object.keys(linhas[0]!);
  return `\uFEFF${[colunas.join(";"), ...linhas.map((l) => colunas.map((c) => celula(l[c])).join(";"))].join("\r\n")}\r\n`;
}
