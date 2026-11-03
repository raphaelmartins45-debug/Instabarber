// Os modelos da página pública (D-198): oito composições tiradas das direções da taste skill,
// cada uma com o seu sistema tipográfico. A cor vem sempre da barbearia e do logótipo. Aqui só o
// que não depende do next/font, para os testes.

export const ESTILOS = [
  "monumento",
  "sala_escura",
  "cartaz",
  "cartao",
  "palco",
  "bairro",
  "anuario",
  "vitrine",
] as const;
export type Estilo = (typeof ESTILOS)[number];

export type AcabamentoEstilo = {
  /** Largura média de uma letra do título, em «em», já com o espaçamento e as maiúsculas. */
  largura: number;
  maiusculas: boolean;
  minusculas?: boolean;
  /** Espaçamento entre letras do título, em «em». */
  espacamento: number;
  /** Peso da letra do título. */
  peso: number;
  /** Fundo das secções: claro (papel) ou escuro. */
  fundo: "claro" | "escuro";
  /** Tamanho máximo do nome no ecrã largo, em vw, quando a letra é estreita. */
  maximo?: number;
};

// Larguras medidas no navegador (a maior de vários nomes, já com o espaçamento e as maiúsculas).
export const ACABAMENTO: Record<Estilo, AcabamentoEstilo> = {
  monumento: {
    largura: 0.3,
    maiusculas: false,
    espacamento: -0.04,
    peso: 400,
    fundo: "claro",
    maximo: 30,
  },
  sala_escura: { largura: 0.5, maiusculas: false, espacamento: -0.05, peso: 300, fundo: "escuro" },
  cartaz: { largura: 0.61, maiusculas: true, espacamento: -0.05, peso: 900, fundo: "claro" },
  cartao: { largura: 0.5, maiusculas: false, espacamento: -0.02, peso: 600, fundo: "claro" },
  palco: {
    largura: 0.5,
    maiusculas: false,
    minusculas: true,
    espacamento: -0.04,
    peso: 400,
    fundo: "escuro",
  },
  bairro: { largura: 0.44, maiusculas: false, espacamento: -0.04, peso: 300, fundo: "claro" },
  anuario: { largura: 0.52, maiusculas: false, espacamento: -0.04, peso: 500, fundo: "claro" },
  vitrine: { largura: 0.5, maiusculas: false, espacamento: -0.02, peso: 600, fundo: "claro" },
};

export function estiloDe(valor: string | null | undefined): Estilo {
  return (ESTILOS as readonly string[]).includes(valor ?? "") ? (valor as Estilo) : "monumento";
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
 * O nome em grande (D-198): as linhas e o tamanho, em vw, para ocupar `util` vw sem quebrar. No
 * ecrã largo, uma linha, ou duas quando numa só ficaria pequeno; no estreito (telemóvel), uma
 * palavra por linha, até três. `util` e `maximo` permitem aos modelos ocupar só uma parte.
 */
export function nomeMonumento(
  nome: string,
  estilo: Estilo,
  ecra: keyof typeof ECRAS = "largo",
  medida?: { util?: number; maximo?: number },
): { linhas: string[]; vw: number } {
  const a = ACABAMENTO[estilo];
  const e = {
    ...ECRAS[ecra],
    ...(ecra === "largo" && a.maximo ? { maximo: a.maximo } : {}),
    ...medida,
  };
  const tamanho = (linhas: string[]) =>
    e.util / Math.max(Math.max(...linhas.map((l) => l.length)) * a.largura, 1);
  const palavras = nome.trim().split(/\s+/);
  const uma = [palavras.join(" ")];
  if (tamanho(uma) >= e.minimoUmaLinha || palavras.length === 1)
    return { linhas: uma, vw: Math.min(tamanho(uma), e.maximo) };
  const linhas = partir(palavras, e.maxLinhas);
  return { linhas, vw: Math.min(tamanho(linhas), e.maximo) };
}
