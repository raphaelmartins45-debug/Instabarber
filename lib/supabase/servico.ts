import "server-only";
import { createClient } from "@supabase/supabase-js";
import { variavel } from "@/lib/configuracao/ambiente";

/**
 * Cliente com a chave de serviço: ignora o RLS. NUNCA no browser.
 * Só para o que o RLS não pode fazer (CLAUDE.md §3): criar contas de autenticação,
 * verificar o código de acesso do cliente, contar limites de pedidos e criar os URLs
 * de carregamento da adesão.
 */
export function criarClienteServico() {
  return createClient(variavel("NEXT_PUBLIC_SUPABASE_URL"), variavel("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
