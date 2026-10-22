import { en } from "./en";
import type { TextosPublicos } from "./forma";
import { fr } from "./fr";
import { pt } from "./pt";

// Os textos da página pública e da área de cliente na língua escolhida (I.3.2).

export type Lingua = "pt" | "en" | "fr";
export const LINGUAS: readonly Lingua[] = ["pt", "en", "fr"];
export type { TextosPublicos };

const DICIONARIOS: Record<Lingua, TextosPublicos> = { pt, en, fr };

export function textosPublicos(lingua: Lingua): TextosPublicos {
  return DICIONARIOS[lingua];
}

/** Língua de abertura: só os dois primeiros caracteres; pt e fr, qualquer outra abre em inglês. */
export function linguaDoDispositivo(acceptLanguage: string | null): Lingua {
  const codigo = (acceptLanguage ?? "").trim().slice(0, 2).toLowerCase();
  if (!codigo || codigo === "pt") return "pt";
  return codigo === "fr" ? "fr" : "en";
}
