import { jsPDF } from "jspdf";
import { type Assinatura, linhasDaAssinatura } from "@/lib/documentos/assinatura";

// O estilo comum dos PDFs (D-184): a mesma paleta do modo claro do sistema (D-134) e o dourado da
// marca (Parte I) só em pormenores, a mesma letra (Helvetica) e a mesma assinatura em todos.

export type Cor = [number, number, number];

/** Texto principal (`--texto` do modo claro). */
export const TINTA: Cor = [0x09, 0x09, 0x0b];
/** Cinzento-escuro (`--texto-2`): texto secundário e as linhas da assinatura. */
export const CINZA_ESCURO: Cor = [0x52, 0x52, 0x5b];
/** Cinzento (`--texto-3`): rótulos e rodapés. */
export const CINZA: Cor = [0x65, 0x65, 0x6e];
/** Separadores (`--borda` e `--borda-forte` sobre branco). */
export const LINHA: Cor = [0xeb, 0xeb, 0xec];
export const LINHA_FORTE: Cor = [0xdd, 0xdd, 0xde];
/** Fundo de realce discreto (`--sup-elevado`). */
export const REALCE: Cor = [0xf4, 0xf4, 0xf5];
/** Dourado da marca (Parte I): barras, marcadores e números. Nunca em texto corrido. */
export const DOURADO: Cor = [0xf5, 0xa6, 0x23];
/** Dourado legível sobre branco (`--ac-texto` do modo claro, contraste AA). */
export const OURO_TEXTO: Cor = [0x94, 0x5c, 0x00];
/** Amarelo claro (Parte I): o fundo das notas. */
export const AMARELO_CLARO: Cor = [0xfd, 0xf3, 0xe3];
/** Fundo escuro das capas (`--sup-fundo` do modo escuro). */
export const FUNDO: Cor = [0x09, 0x09, 0x0b];

export function corDeHex(hex: string): Cor {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return TINTA;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * O formato dos números e do dinheiro usa espaços inquebráveis («39,99 €»). As letras padrão
 * do jsPDF medem-nos mais largos do que os desenham, e os valores alinhados à direita saíam
 * desalinhados: trocam-se por espaços normais antes de medir e de escrever.
 */
const ESPACOS_FINOS = /[\u00a0\u202f\u2009]/g;
const normalizar = <T>(texto: T): T =>
  (typeof texto === "string"
    ? texto.replace(ESPACOS_FINOS, " ")
    : Array.isArray(texto)
      ? texto.map((t) => (typeof t === "string" ? t.replace(ESPACOS_FINOS, " ") : t))
      : texto) as T;

/** Um documento novo (A4 ao alto por omissão), com o texto normalizado ao medir e ao escrever. */
export function criarDocumento(
  o: { formato?: "a4" | "a6"; orientacao?: "portrait" | "landscape" } = {},
): jsPDF {
  const doc = new jsPDF({
    unit: "mm",
    format: o.formato ?? "a4",
    orientation: o.orientacao ?? "portrait",
  });
  const texto = doc.text.bind(doc);
  const largura = doc.getTextWidth.bind(doc);
  const partir = doc.splitTextToSize.bind(doc);
  doc.text = ((t: string | string[], ...resto: unknown[]) =>
    (texto as (...a: unknown[]) => jsPDF)(normalizar(t), ...resto)) as jsPDF["text"];
  doc.getTextWidth = (t: string) => largura(normalizar(t));
  doc.splitTextToSize = ((t: string, ...resto: unknown[]) =>
    (partir as (...a: unknown[]) => string[])(normalizar(t), ...resto)) as jsPDF["splitTextToSize"];
  return doc;
}

/**
 * Rótulo em maiúsculas com espaço entre letras. O jsPDF não conta esse espaço ao alinhar à
 * direita, por isso a posição calcula-se aqui.
 */
export function rotuloEspacado(
  doc: jsPDF,
  texto: string,
  x: number,
  y: number,
  alinhamento: "left" | "right" = "left",
  espaco = 0.35,
) {
  const maiusculas = texto.toUpperCase();
  const largura = doc.getTextWidth(maiusculas) + espaco * Math.max(0, maiusculas.length - 1);
  doc.text(maiusculas, alinhamento === "right" ? x - largura : x, y, { charSpace: espaco });
}

export const ALTURA_ASSINATURA = 6 + 3 * 4.6;

/**
 * A assinatura (D-184): o nome a preto e negrito; por baixo, sem negrito e em cinzento-escuro,
 * o cargo, o WhatsApp e o e-mail. Devolve o y a seguir à última linha.
 */
export function desenharAssinatura(doc: jsPDF, x: number, y: number, a: Assinatura): number {
  doc
    .setFont("helvetica", "bold")
    .setFontSize(11)
    .setTextColor(...TINTA)
    .text(a.nome, x, y);
  let yy = y + 5.4;
  doc
    .setFont("helvetica", "normal")
    .setFontSize(9.5)
    .setTextColor(...CINZA_ESCURO);
  for (const linha of linhasDaAssinatura(a)) {
    doc.text(linha, x, yy);
    yy += 4.6;
  }
  return yy;
}
