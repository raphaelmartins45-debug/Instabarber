import { Alfa_Slab_One, Anton, Bodoni_Moda, DM_Serif_Display } from "next/font/google";
import type { Estilo } from "@/lib/publico/estilos";

// As letras dos estilos da página pública (D-198), servidas pelo próprio site (next/font). Cada
// uma só é descarregada pela página que a usa. Todas definem a mesma variável, --letra-estilo,
// para os títulos das secções a usarem sem saber o estilo.

const classico = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-estilo",
});
const urbano = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-estilo",
});
const luxo = Bodoni_Moda({
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-estilo",
});
const vintage = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--letra-estilo",
});

const FONTES = { classico, urbano, luxo, vintage };

/** A classe que aplica a letra do estilo ao próprio elemento. */
export const LETRA_DO_ESTILO: Record<Estilo, string> = {
  classico: classico.className,
  urbano: urbano.className,
  luxo: luxo.className,
  vintage: vintage.className,
};

/** A classe que define --letra-estilo (e o acabamento, por data-estilo) para os descendentes. */
export function variavelDoEstilo(estilo: Estilo): string {
  return FONTES[estilo].variable;
}
