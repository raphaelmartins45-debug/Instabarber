import {
  DM_Sans,
  Jost,
  Manrope,
  Montserrat,
  Outfit,
  Poppins,
  Raleway,
  Urbanist,
} from "next/font/google";
import type { Estilo } from "@/lib/publico/estilos";

// As letras dos modelos da página pública (D-201): sem serifa, geométricas e sóbrias (Montserrat,
// Raleway, Urbanist, DM Sans, Jost, Manrope, Outfit e Poppins), servidas pelo próprio site
// (next/font). Cada modelo define --letra-titulo e --letra-texto; os ficheiros só são
// descarregados pela página que os usa.

const montserratTitulo = Montserrat({
  weight: ["500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const montserratTexto = Montserrat({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const ralewayTitulo = Raleway({
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const ralewayTexto = Raleway({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const urbanistTitulo = Urbanist({
  weight: ["800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const urbanistTexto = Urbanist({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const dmSansTitulo = DM_Sans({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const dmSansTexto = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const jostTitulo = Jost({
  weight: ["500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const jostTexto = Jost({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const manropeTitulo = Manrope({
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const manropeTexto = Manrope({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const outfitTitulo = Outfit({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const outfitTexto = Outfit({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const poppinsTitulo = Poppins({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const poppinsTexto = Poppins({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});

const PARES: Record<Estilo, [{ variable: string; className: string }, { variable: string }]> = {
  monumento: [montserratTitulo, montserratTexto],
  sala_escura: [ralewayTitulo, ralewayTexto],
  cartaz: [urbanistTitulo, urbanistTexto],
  cartao: [dmSansTitulo, dmSansTexto],
  palco: [jostTitulo, jostTexto],
  bairro: [manropeTitulo, manropeTexto],
  anuario: [outfitTitulo, outfitTexto],
  vitrine: [poppinsTitulo, poppinsTexto],
};

/** A classe que aplica a letra do título ao próprio elemento (miniaturas no painel). */
export const LETRA_DO_ESTILO: Record<Estilo, string> = Object.fromEntries(
  Object.entries(PARES).map(([e, [titulo]]) => [e, titulo.className]),
) as Record<Estilo, string>;

/** As classes que definem --letra-titulo e --letra-texto para a página do modelo. */
export function variavelDoEstilo(estilo: Estilo): string {
  const [titulo, texto] = PARES[estilo];
  return `${titulo.variable} ${texto.variable}`;
}
