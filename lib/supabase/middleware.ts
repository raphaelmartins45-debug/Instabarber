import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";
import type { ClienteBD } from "./tipos";

// Clientes do Supabase para o middleware: lê o process.env diretamente (corre no runtime do middleware).

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const chaveAnonima = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cliente com a sessão dos cookies. Quando o Supabase renova a sessão, `aoRenovar` recebe
 * os cookies novos para os pôr no pedido (servidor) e na resposta (browser).
 */
export function clienteDoPedido(
  pedido: NextRequest,
  aoRenovar: (cookies: { name: string; value: string; options: CookieOptions }[]) => void,
) {
  const cliente = createServerClient<Database>(url(), chaveAnonima(), {
    cookies: {
      getAll: () => pedido.cookies.getAll(),
      setAll: (lista: { name: string; value: string; options: CookieOptions }[]) => {
        lista.forEach(({ name, value }) => pedido.cookies.set(name, value));
        aoRenovar(lista);
      },
    },
  });
  // Ver lib/supabase/servidor.ts: os genéricos do @supabase/ssr 0.5.2.
  return cliente as unknown as ClienteBD;
}

/** Passa os cookies de sessão de uma resposta para outra (redirecionamentos). */
export function copiarCookies(de: NextResponse, para: NextResponse): NextResponse {
  de.cookies.getAll().forEach((cookie) => para.cookies.set(cookie));
  return para;
}

const cacheDominios = new Map<string, { slug: string | null; ate: number }>();
const VALIDADE_MS = 5 * 60 * 1000;

/** O slug da barbearia ativa com este domínio próprio (vista pública), com cache curta. */
export async function slugPorDominio(dominio: string): Promise<string | null> {
  const guardado = cacheDominios.get(dominio);
  if (guardado && guardado.ate > Date.now()) return guardado.slug;
  const bd = createClient<Database>(url(), chaveAnonima(), { auth: { persistSession: false } });
  const { data } = await bd
    .from("publico_inquilinos")
    .select("slug")
    .eq("dominio_proprio", dominio)
    .maybeSingle();
  const slug = data?.slug ?? null;
  cacheDominios.set(dominio, { slug, ate: Date.now() + VALIDADE_MS });
  return slug;
}
