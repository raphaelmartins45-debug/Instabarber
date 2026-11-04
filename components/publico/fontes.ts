import {
  DM_Sans,
  Inter,
  Jost,
  Manrope,
  Montserrat,
  Outfit,
  Poppins,
  Raleway,
  Rubik,
  Sora,
  Space_Grotesk,
  Urbanist,
} from "next/font/google";
import type { Estilo } from "@/lib/publico/estilos";

// As letras dos modelos da página pública (D-201): sem serifa, geométricas e sóbrias (Montserrat,
// Raleway, Urbanist, DM Sans, Jost, Manrope, Outfit, Poppins, Inter, Rubik, Space Grotesk e
// Sora; D-204), servidas pelo próprio site
// (next/font). Cada modelo usa uma só família, nos títulos e no texto, em --letra-familia; os
// ficheiros só são descarregados pela página que os usa.

const montserrat = Montserrat({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const raleway = Raleway({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const urbanist = Urbanist({
  weight: ["400", "500", "600", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const dmSans = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const jost = Jost({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const manrope = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const outfit = Outfit({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const rubik = Rubik({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});
const sora = Sora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-familia",
});

const FAMILIAS: Record<Estilo, { variable: string; className: string }> = {
  monumento: montserrat,
  sala_escura: raleway,
  cartaz: urbanist,
  cartao: dmSans,
  palco: jost,
  bairro: manrope,
  anuario: outfit,
  vitrine: poppins,
  produto: inter,
  pedido: rubik,
  noite: spaceGrotesk,
  bento: sora,
};

/** A classe que aplica a letra do modelo ao próprio elemento (miniaturas no painel). */
export const LETRA_DO_ESTILO: Record<Estilo, string> = Object.fromEntries(
  Object.entries(FAMILIAS).map(([e, f]) => [e, f.className]),
) as Record<Estilo, string>;

/** A classe que define --letra-familia para a página do modelo. */
export function variavelDoEstilo(estilo: Estilo): string {
  return FAMILIAS[estilo].variable;
}
