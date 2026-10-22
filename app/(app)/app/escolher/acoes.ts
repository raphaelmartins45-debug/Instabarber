"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { COOKIE_BARBEARIA } from "@/lib/equipa/contexto";

// Troca de barbearia para quem tem perfis em várias (B.6). O cookie só guarda a escolha:
// o painel confirma o perfil e o RLS confirma cada leitura.

export async function escolherBarbearia(dados: FormData): Promise<void> {
  const id = z.string().uuid().safeParse(dados.get("barbearia"));
  if (id.success) {
    (await cookies()).set(COOKIE_BARBEARIA, id.data, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  redirect("/app");
}
