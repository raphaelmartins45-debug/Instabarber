import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { variavel } from "@/lib/configuracao/ambiente";
import type { Database } from "@/types/database";
import type { ClienteBD } from "./tipos";

/**
 * Cliente do servidor com a sessão do utilizador (cookies). Continua sujeito ao RLS.
 * O @supabase/ssr 0.5.2 (B.3) declara os genéricos do supabase-js antigo: o tipo
 * converte-se para o ClienteBD dos repositórios, que é o mesmo cliente.
 */
export async function criarClienteServidor(): Promise<ClienteBD> {
  const loja = await cookies();
  const cliente = createServerClient<Database>(
    variavel("NEXT_PUBLIC_SUPABASE_URL"),
    variavel("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => loja.getAll(),
        setAll: (lista: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            lista.forEach(({ name, value, options }) => loja.set(name, value, options));
          } catch {
            // Chamado a partir de um Server Component: o middleware renova a sessão.
          }
        },
      },
    },
  );
  return cliente as unknown as ClienteBD;
}
