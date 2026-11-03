import {
  Albert_Sans,
  Besley,
  Chivo,
  Hanken_Grotesk,
  Imbue,
  Libre_Franklin,
  Literata,
  Newsreader,
  Schibsted_Grotesk,
  Work_Sans,
  Zilla_Slab,
} from "next/font/google";
import type { Estilo } from "@/lib/publico/estilos";

// As letras dos modelos da página pública (D-198), os sistemas tipográficos da taste skill,
// servidos pelo próprio site (next/font). Cada modelo define --letra-titulo e --letra-texto; os
// ficheiros só são descarregados pela página que os usa.

const imbue = Imbue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const albertTexto = Albert_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const workTitulo = Work_Sans({
  weight: "300",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const workTexto = Work_Sans({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const chivoTitulo = Chivo({
  weight: "900",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const chivoTexto = Chivo({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const zillaTitulo = Zilla_Slab({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const zillaTexto = Zilla_Slab({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const besley = Besley({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const franklin = Libre_Franklin({
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const newsreader = Newsreader({
  weight: "300",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const hanken = Hanken_Grotesk({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const schibstedTitulo = Schibsted_Grotesk({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});
const schibstedTexto = Schibsted_Grotesk({
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-texto",
});
const literata = Literata({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-titulo",
});

const PARES: Record<Estilo, [{ variable: string; className: string }, { variable: string }]> = {
  monumento: [imbue, albertTexto],
  sala_escura: [workTitulo, workTexto],
  cartaz: [chivoTitulo, chivoTexto],
  cartao: [zillaTitulo, zillaTexto],
  palco: [besley, franklin],
  bairro: [newsreader, hanken],
  anuario: [schibstedTitulo, schibstedTexto],
  vitrine: [literata, albertTexto],
};

/** A classe que aplica a letra do título ao próprio elemento (pré-visualização no painel). */
export const LETRA_DO_ESTILO: Record<Estilo, string> = Object.fromEntries(
  Object.entries(PARES).map(([e, [titulo]]) => [e, titulo.className]),
) as Record<Estilo, string>;

/** As classes que definem --letra-titulo e --letra-texto para a página do modelo. */
export function variavelDoEstilo(estilo: Estilo): string {
  const [titulo, texto] = PARES[estilo];
  return `${titulo.variable} ${texto.variable}`;
}
