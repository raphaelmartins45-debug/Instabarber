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

/**
 * Vários quadros num só CSV (Finanças, O.10): umas linhas de cabeçalho e, para cada secção, o
 * título, as colunas e as linhas, separados por uma linha em branco. Um só BOM no início.
 */
export function seccoesParaCsv(
  cabecalho: string[],
  seccoes: { titulo: string; linhas: Record<string, unknown>[] }[],
): string {
  const blocos = seccoes.map((s) => {
    const colunas = s.linhas[0] ? Object.keys(s.linhas[0]) : [];
    return [
      celula(s.titulo),
      ...(colunas.length ? [colunas.map(celula).join(";")] : []),
      ...s.linhas.map((l) => colunas.map((c) => celula(l[c])).join(";")),
    ].join("\r\n");
  });
  return `\uFEFF${[cabecalho.map(celula).join("\r\n"), ...blocos].join("\r\n\r\n")}\r\n`;
}
