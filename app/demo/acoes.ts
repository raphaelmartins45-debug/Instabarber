"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_DEMO } from "@/lib/admin/acesso-demonstracao";
import { ipDoPedido } from "@/lib/inquilino/endereco";
import { codigoDemonstracaoValido } from "@/lib/repositorios/admin/demonstracao";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// A entrada com código em instabarber.pt/demo (D-208). A chave de serviço só conta as tentativas
// (CLAUDE.md §3); o código confere-se na base de dados, que guarda só o hash.

export type EstadoCodigo = { erro?: "errado" | "limite" };

export async function entrarComCodigo(
  _anterior: EstadoCodigo,
  formulario: FormData,
): Promise<EstadoCodigo> {
  const codigo = String(formulario.get("codigo") ?? "").replace(/\D/g, "");
  const ip = await ipDoPedido();
  if (!(await consumirLimite(criarClienteServico(), `demo:ip:${ip}`, LIMITES.codigoDemoIp)))
    return { erro: "limite" };
  if (
    codigo.length !== 6 ||
    !(await codigoDemonstracaoValido(await criarClienteServidor(), codigo))
  )
    return { erro: "errado" };
  (await cookies()).set(COOKIE_DEMO, codigo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  redirect("/demo");
}
