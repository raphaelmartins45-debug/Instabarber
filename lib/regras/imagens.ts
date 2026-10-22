// Regras das imagens da adesão (D.8.1). O formulário verifica tudo antes de carregar; a rota
// volta a verificar o formato e o tamanho antes de criar o URL assinado.

export type TipoImagem = "logo" | "capa" | "galeria";

type Regra = {
  formatos: readonly string[];
  maxBytes: number;
  minLargura: number;
  minAltura: number;
};

const MB = 1024 * 1024;

export const REGRAS_IMAGEM: Record<TipoImagem, Regra> = {
  logo: {
    formatos: ["image/png", "image/svg+xml", "image/webp"],
    maxBytes: 1 * MB,
    minLargura: 512,
    minAltura: 512,
  },
  capa: {
    formatos: ["image/jpeg", "image/webp"],
    maxBytes: 3 * MB,
    minLargura: 1600,
    minAltura: 900,
  },
  galeria: {
    formatos: ["image/jpeg", "image/webp"],
    maxBytes: 3 * MB,
    minLargura: 1200,
    minAltura: 800,
  },
};

/** Até 6 imagens na galeria, contando com a fachada (que é sempre a primeira). */
export const MAXIMO_GALERIA_COM_CAPA = 6;

const EXTENSOES: Record<string, string> = {
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

export function extensaoDe(formato: string): string | null {
  return EXTENSOES[formato] ?? null;
}

export type ErroImagem = "formato" | "tamanho" | "dimensoes";

/** Nulo se a imagem cumpre a regra. As dimensões só se verificam se forem conhecidas (o SVG não as tem). */
export function verificarImagem(
  tipo: TipoImagem,
  imagem: { formato: string; tamanho: number; largura?: number; altura?: number },
): ErroImagem | null {
  const regra = REGRAS_IMAGEM[tipo];
  if (!regra.formatos.includes(imagem.formato)) return "formato";
  if (imagem.tamanho > regra.maxBytes) return "tamanho";
  if (imagem.largura !== undefined && imagem.altura !== undefined) {
    if (imagem.largura < regra.minLargura || imagem.altura < regra.minAltura) return "dimensoes";
  }
  return null;
}

/** Caminho no bucket privado: adesoes/<pasta>/<logo|capa|galeria-N>.<ext>. */
export function caminhoImagemAdesao(
  pasta: string,
  tipo: TipoImagem,
  posicao: number,
  formato: string,
): string {
  const ext = extensaoDe(formato);
  if (!ext) throw new Error("formato");
  const nome = tipo === "galeria" ? `galeria-${posicao}` : tipo;
  return `adesoes/${pasta}/${nome}.${ext}`;
}
