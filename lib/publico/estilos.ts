// Os estilos da página pública (D-198): a letra e o acabamento do nome e dos títulos. O texto
// corrido continua na Inter (I.2). Aqui só o que não depende do next/font, para os testes.

export const ESTILOS = ["classico", "urbano", "luxo", "vintage"] as const;
export type Estilo = (typeof ESTILOS)[number];

export type AcabamentoEstilo = {
  /** Largura média de uma letra, em «em», com as maiúsculas quando o estilo as usa. */
  largura: number;
  maiusculas: boolean;
  /** Espaçamento entre letras do nome, em «em». */
  espacamento: number;
};

export const ACABAMENTO: Record<Estilo, AcabamentoEstilo> = {
  // Larguras medidas no navegador (a maior de vários nomes), já com o espaçamento.
  classico: { largura: 0.5, maiusculas: false, espacamento: -0.03 },
  urbano: { largura: 0.46, maiusculas: true, espacamento: -0.01 },
  luxo: { largura: 0.66, maiusculas: true, espacamento: 0.02 },
  vintage: { largura: 0.77, maiusculas: true, espacamento: -0.02 },
};

export function estiloDe(valor: string | null | undefined): Estilo {
  return (ESTILOS as readonly string[]).includes(valor ?? "") ? (valor as Estilo) : "classico";
}

// vw ocupados pelo nome (as margens ficam de fora), tamanho máximo e mínimo numa linha.
const ECRAS = {
  largo: { util: 92, maximo: 22, minimoUmaLinha: 11, maxLinhas: 2 },
  estreito: { util: 86, maximo: 32, minimoUmaLinha: 99, maxLinhas: 3 },
} as const;

/** Parte as palavras em até `n` linhas, com a linha mais comprida o mais curta possível. */
function partir(palavras: string[], n: number): string[] {
  if (palavras.length <= n) return palavras;
  let melhor: string[] = [palavras.join(" ")];
  const comprimento = (linhas: string[]) => Math.max(...linhas.map((l) => l.length));
  const procurar = (resto: string[], linhas: string[]) => {
    if (linhas.length === n - 1 || resto.length === 1) {
      const todas = [...linhas, resto.join(" ")];
      if (comprimento(todas) < comprimento(melhor)) melhor = todas;
      return;
    }
    for (let i = 1; i < resto.length; i++)
      procurar(resto.slice(i), [...linhas, resto.slice(0, i).join(" ")]);
  };
  procurar(palavras, []);
  return melhor;
}

/**
 * O nome como monumento (D-198): as linhas e o tamanho, em vw, para ocupar a largura da página
 * sem quebrar. No ecrã largo, uma linha, ou duas quando numa só ficaria pequeno; no estreito
 * (telemóvel), uma palavra por linha, até três, para o nome ficar grande.
 */
export function nomeMonumento(
  nome: string,
  estilo: Estilo,
  ecra: keyof typeof ECRAS = "largo",
): { linhas: string[]; vw: number } {
  const e = ECRAS[ecra];
  const a = ACABAMENTO[estilo];
  const tamanho = (linhas: string[]) =>
    e.util / Math.max(Math.max(...linhas.map((l) => l.length)) * a.largura, 1);
  const palavras = nome.trim().split(/\s+/);
  const uma = [palavras.join(" ")];
  if (tamanho(uma) >= e.minimoUmaLinha || palavras.length === 1)
    return { linhas: uma, vw: Math.min(tamanho(uma), e.maximo) };
  const linhas = partir(palavras, e.maxLinhas);
  return { linhas, vw: Math.min(tamanho(linhas), e.maximo) };
}
