import "server-only";
import { cookies, headers } from "next/headers";
import { linguaDoDispositivo, LINGUAS, textosPublicos, type Lingua } from "@/lib/i18n/publico";

// A língua da página pública e da área de cliente (I.3.2): só com `multilinguagem` ligada; a
// escolha manual fica num cookie; sem ela, a língua do dispositivo.

export const COOKIE_LINGUA = "ib_lingua";

export async function linguaPublica(multilinguagem: boolean): Promise<Lingua> {
  if (!multilinguagem) return "pt";
  const escolhida = (await cookies()).get(COOKIE_LINGUA)?.value as Lingua | undefined;
  if (escolhida && LINGUAS.includes(escolhida)) return escolhida;
  return linguaDoDispositivo((await headers()).get("accept-language"));
}

export async function textosDaPagina(multilinguagem: boolean) {
  const lingua = await linguaPublica(multilinguagem);
  return { lingua, t: textosPublicos(lingua) };
}
