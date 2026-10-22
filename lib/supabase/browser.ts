import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** Cliente do browser, com a chave anónima. Tudo o que lê passa pelo RLS. */
export function criarClienteBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
