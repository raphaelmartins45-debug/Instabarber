import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// O tailwind-merge tem de conhecer a escala de texto com nome do sistema (D-183): sem isto,
// `text-mini` seria lido como uma cor e apagado ao lado de `text-terciario`.
const juntar = extendTailwindMerge({
  extend: { theme: { text: ["titulo", "secao", "mini"] } },
});

/** Junta classes do Tailwind sem conflitos (convenção do shadcn/ui). */
export function cn(...entradas: ClassValue[]) {
  return juntar(clsx(entradas));
}
