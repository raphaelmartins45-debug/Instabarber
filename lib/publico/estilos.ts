// Os modelos da página pública (D-198, revistos na D-200). A cor da barbearia (a do fundo do
// logótipo) fica no cabeçalho, nos botões e no rodapé; o corpo é sempre claro e arrumado em
// cartões. O que muda de modelo para modelo é a letra, o cabeçalho e a organização do corpo.
// Aqui só o que não depende do next/font, para os testes.

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

export type Modelo = {
  /** Como se arruma o cabeçalho: logótipo, nome e ações. */
  cabecalho: "centrado" | "dividido" | "faixa" | "cartao" | "painel" | "montra";
  /** Como se arruma o corpo: uma coluna, coluna com lateral fixa, ou títulos à esquerda. */
  corpo: "coluna" | "lateral" | "editorial";
  /** Os serviços numa lista dentro de um cartão, ou em cartões lado a lado. */
  servicos: "lista" | "grelha";
  /** O raio dos cartões e dos botões, em px. */
  raio: number;
  /** Títulos em maiúsculas. */
  maiusculas: boolean;
  /** Peso da letra dos títulos. */
  peso: number;
};

export const MODELOS: Record<Estilo, Modelo> = {
  monumento: {
    cabecalho: "centrado",
    corpo: "coluna",
    servicos: "lista",
    raio: 6,
    maiusculas: false,
    peso: 400,
  },
  sala_escura: {
    cabecalho: "dividido",
    corpo: "lateral",
    servicos: "lista",
    raio: 0,
    maiusculas: false,
    peso: 300,
  },
  cartaz: {
    cabecalho: "faixa",
    corpo: "coluna",
    servicos: "grelha",
    raio: 0,
    maiusculas: true,
    peso: 900,
  },
  cartao: {
    cabecalho: "cartao",
    corpo: "coluna",
    servicos: "lista",
    raio: 10,
    maiusculas: false,
    peso: 600,
  },
  palco: {
    cabecalho: "painel",
    corpo: "editorial",
    servicos: "lista",
    raio: 0,
    maiusculas: false,
    peso: 400,
  },
  bairro: {
    cabecalho: "centrado",
    corpo: "coluna",
    servicos: "grelha",
    raio: 18,
    maiusculas: false,
    peso: 400,
  },
  anuario: {
    cabecalho: "dividido",
    corpo: "editorial",
    servicos: "grelha",
    raio: 12,
    maiusculas: false,
    peso: 500,
  },
  vitrine: {
    cabecalho: "montra",
    corpo: "lateral",
    servicos: "lista",
    raio: 8,
    maiusculas: false,
    peso: 600,
  },
};

export function estiloDe(valor: string | null | undefined): Estilo {
  return (ESTILOS as readonly string[]).includes(valor ?? "") ? (valor as Estilo) : "monumento";
}
