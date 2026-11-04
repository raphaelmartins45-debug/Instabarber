// Os modelos da página pública (D-198, D-200, D-201). Cada modelo tem o seu estilo: letras,
// paleta, arrumação do cabeçalho e do corpo. A cor escolhida pela barbearia fica só no
// cabeçalho, onde está o logótipo. Aqui só o que não depende do next/font, para os testes.

export const ESTILOS = [
  "monumento",
  "sala_escura",
  "cartaz",
  "cartao",
  "palco",
  "bairro",
  "anuario",
  "vitrine",
  "produto",
  "pedido",
  "noite",
  "bento",
] as const;
export type Estilo = (typeof ESTILOS)[number];

/** As cores próprias de cada modelo; só o cabeçalho tem a cor escolhida pela barbearia. */
export type Paleta = {
  fundo: string;
  cartao: string;
  camada: string;
  texto: string;
  texto2: string;
  borda: string;
  destaque: string;
  sobreDestaque: string;
  rodape: string;
  sobreRodape: string;
  escuro?: boolean;
};

export type Modelo = {
  /** Como se arruma o cabeçalho: logótipo, nome e ações. */
  cabecalho:
    | "centrado"
    | "dividido"
    | "faixa"
    | "cartao"
    | "painel"
    | "montra"
    | "destaque"
    | "loja";
  /** Como se arruma o corpo: uma coluna, coluna com lateral fixa, ou títulos à esquerda. */
  corpo: "coluna" | "lateral" | "editorial" | "bento";
  /** Os serviços numa lista dentro de um cartão, ou em cartões lado a lado. */
  servicos: "lista" | "grelha";
  /** O raio dos cartões e dos botões, em px. */
  raio: number;
  /** O raio dos botões, quando é diferente do dos cartões (cápsulas: 999). */
  raioBotao?: number;
  /** Títulos em maiúsculas. */
  maiusculas: boolean;
  /** Peso da letra dos títulos. */
  peso: number;
  paleta: Paleta;
};

// Oito direções da skill UI/UX Pro Max (D-201), cada uma com a sua paleta e o seu par de letras.
export const MODELOS: Record<Estilo, Modelo> = {
  // Luxo: escuro e dourado, títulos em maiúsculas espaçadas (Montserrat).
  monumento: {
    cabecalho: "centrado",
    corpo: "coluna",
    servicos: "lista",
    raio: 2,
    maiusculas: true,
    peso: 500,
    paleta: {
      fundo: "#0E0D0B",
      cartao: "#181613",
      camada: "#24211C",
      texto: "#F3EEE4",
      texto2: "#B9AF9E",
      borda: "rgba(201, 162, 74, 0.28)",
      destaque: "#C9A24A",
      sobreDestaque: "#17120A",
      rodape: "#070706",
      sobreRodape: "#E9E1D2",
      escuro: true,
    },
  },
  // Vintage: creme, vermelho de barbearia e verde-azulado (Raleway).
  sala_escura: {
    cabecalho: "dividido",
    corpo: "lateral",
    servicos: "lista",
    raio: 2,
    maiusculas: false,
    peso: 700,
    paleta: {
      fundo: "#F3E7CF",
      cartao: "#FBF4E4",
      camada: "#EADBBD",
      texto: "#2A1E14",
      texto2: "#5E4A36",
      borda: "rgba(42, 30, 20, 0.22)",
      destaque: "#A3322A",
      sobreDestaque: "#FFFFFF",
      rodape: "#1F3A3B",
      sobreRodape: "#F3E7CF",
    },
  },
  // Urbano: neobrutalista, amarelo e preto, cantos retos (Urbanist).
  cartaz: {
    cabecalho: "faixa",
    corpo: "coluna",
    servicos: "grelha",
    raio: 0,
    maiusculas: true,
    peso: 800,
    paleta: {
      fundo: "#EFEFEA",
      cartao: "#FFFFFF",
      camada: "#E2E2DC",
      texto: "#0A0A0A",
      texto2: "#3F3F3B",
      borda: "#0A0A0A",
      destaque: "#FFD400",
      sobreDestaque: "#0A0A0A",
      rodape: "#0A0A0A",
      sobreRodape: "#FFD400",
    },
  },
  // Minimal: preto e branco, suíço (DM Sans).
  cartao: {
    cabecalho: "cartao",
    corpo: "coluna",
    servicos: "lista",
    raio: 8,
    maiusculas: false,
    peso: 600,
    paleta: {
      fundo: "#F6F6F6",
      cartao: "#FFFFFF",
      camada: "#ECECEC",
      texto: "#111111",
      texto2: "#555555",
      borda: "rgba(17, 17, 17, 0.10)",
      destaque: "#111111",
      sobreDestaque: "#FFFFFF",
      rodape: "#111111",
      sobreRodape: "#F6F6F6",
    },
  },
  // Editorial: papel e terracota, títulos à esquerda (Jost).
  palco: {
    cabecalho: "painel",
    corpo: "editorial",
    servicos: "lista",
    raio: 0,
    maiusculas: false,
    peso: 500,
    paleta: {
      fundo: "#F7F3EC",
      cartao: "#FFFDF9",
      camada: "#EDE6DA",
      texto: "#1A1714",
      texto2: "#5B534A",
      borda: "rgba(26, 23, 20, 0.14)",
      destaque: "#A8482A",
      sobreDestaque: "#FFFFFF",
      rodape: "#1A1714",
      sobreRodape: "#F7F3EC",
    },
  },
  // Natural: bege e verde-floresta, cantos redondos (Manrope).
  bairro: {
    cabecalho: "centrado",
    corpo: "coluna",
    servicos: "grelha",
    raio: 18,
    maiusculas: false,
    peso: 700,
    paleta: {
      fundo: "#F1EDE3",
      cartao: "#FFFFFF",
      camada: "#E4DED0",
      texto: "#1E2A20",
      texto2: "#4E5A4F",
      borda: "rgba(30, 42, 32, 0.12)",
      destaque: "#2F6B3A",
      sobreDestaque: "#FFFFFF",
      rodape: "#1E3324",
      sobreRodape: "#F1EDE3",
    },
  },
  // Moderno: claro e azul elétrico (Outfit).
  anuario: {
    cabecalho: "dividido",
    corpo: "editorial",
    servicos: "grelha",
    raio: 12,
    maiusculas: false,
    peso: 600,
    paleta: {
      fundo: "#F3F5FA",
      cartao: "#FFFFFF",
      camada: "#E3E8F2",
      texto: "#0F172A",
      texto2: "#475569",
      borda: "rgba(15, 23, 42, 0.10)",
      destaque: "#2547F4",
      sobreDestaque: "#FFFFFF",
      rodape: "#0F172A",
      sobreRodape: "#E3E8F2",
    },
  },
  // Colorido: creme quente e coral, cantos muito redondos (Poppins).
  vitrine: {
    cabecalho: "montra",
    corpo: "lateral",
    servicos: "lista",
    raio: 16,
    maiusculas: false,
    peso: 600,
    paleta: {
      fundo: "#FFF4E6",
      cartao: "#FFFFFF",
      camada: "#FFE6C7",
      texto: "#2B1B12",
      texto2: "#6A4E3C",
      borda: "rgba(43, 27, 18, 0.12)",
      destaque: "#C2402A",
      sobreDestaque: "#FFFFFF",
      rodape: "#2B1B12",
      sobreRodape: "#FFE6C7",
    },
  },
  // Produto (D-204): muito espaço, o nome enorme ao centro, cinzento claro e botões em cápsula
  // azuis, à maneira das páginas de produto das grandes marcas de tecnologia (Inter).
  produto: {
    cabecalho: "destaque",
    corpo: "coluna",
    servicos: "grelha",
    raio: 22,
    raioBotao: 999,
    maiusculas: false,
    peso: 700,
    paleta: {
      fundo: "#F5F5F7",
      cartao: "#FFFFFF",
      camada: "#E8E8ED",
      texto: "#1D1D1F",
      texto2: "#56565B",
      borda: "rgba(29, 29, 31, 0.08)",
      destaque: "#0A66D6",
      sobreDestaque: "#FFFFFF",
      rodape: "#F5F5F7",
      sobreRodape: "#1D1D1F",
    },
  },
  // Pedido (D-204): cabeçalho de loja com separadores, vermelho vivo e cartões com o preço em
  // destaque, à maneira das aplicações de entregas (Rubik).
  pedido: {
    cabecalho: "loja",
    corpo: "coluna",
    servicos: "lista",
    raio: 12,
    raioBotao: 999,
    maiusculas: false,
    peso: 700,
    paleta: {
      fundo: "#F7F7F7",
      cartao: "#FFFFFF",
      camada: "#EFEFEF",
      texto: "#3E3E3E",
      texto2: "#5F5F5F",
      borda: "rgba(62, 62, 62, 0.10)",
      destaque: "#D61F3A",
      sobreDestaque: "#FFFFFF",
      rodape: "#3E3E3E",
      sobreRodape: "#FFFFFF",
    },
  },
  // Noite (D-204): escuro profundo com verde-lima elétrico (Dark Mode OLED, Space Grotesk).
  noite: {
    cabecalho: "dividido",
    corpo: "lateral",
    servicos: "lista",
    raio: 14,
    maiusculas: false,
    peso: 600,
    paleta: {
      fundo: "#0A0A0E",
      cartao: "#15151C",
      camada: "#20202A",
      texto: "#F2F2F5",
      texto2: "#A3A3B2",
      borda: "rgba(255, 255, 255, 0.09)",
      destaque: "#C6F432",
      sobreDestaque: "#0A0A0E",
      rodape: "#000000",
      sobreRodape: "#C6F432",
      escuro: true,
    },
  },
  // Bento (D-204): o corpo em mosaico de blocos de tamanhos diferentes, violeta (Bento Grid, Sora).
  bento: {
    cabecalho: "centrado",
    corpo: "bento",
    servicos: "lista",
    raio: 24,
    maiusculas: false,
    peso: 700,
    paleta: {
      fundo: "#EFEFF3",
      cartao: "#FFFFFF",
      camada: "#E4E4EC",
      texto: "#16141F",
      texto2: "#56536A",
      borda: "rgba(22, 20, 31, 0.08)",
      destaque: "#6440F0",
      sobreDestaque: "#FFFFFF",
      rodape: "#16141F",
      sobreRodape: "#EFEFF3",
    },
  },
};

export function estiloDe(valor: string | null | undefined): Estilo {
  return (ESTILOS as readonly string[]).includes(valor ?? "") ? (valor as Estilo) : "monumento";
}
