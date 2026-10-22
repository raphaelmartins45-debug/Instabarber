"use server";

import { cookies } from "next/headers";
import { LINGUAS, type Lingua } from "@/lib/i18n/publico";
import { COOKIE_LINGUA } from "@/lib/publico/lingua";

/** A língua escolhida no seletor (I.3.2), guardada um ano. */
export async function escolherLingua(lingua: Lingua): Promise<void> {
  if (!LINGUAS.includes(lingua)) return;
  (await cookies()).set(COOKIE_LINGUA, lingua, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
