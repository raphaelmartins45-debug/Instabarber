import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { variavel } from "@/lib/configuracao/ambiente";

/** Cliente do servidor com a sessão do utilizador (cookies). Continua sujeito ao RLS. */
export async function criarClienteServidor() {
  const loja = await cookies();
  return createServerClient(
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
}
