import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Leitura completa de uma tabela para a exportação (o super_admin lê tudo: *_admin_ler).

export async function lerTudo(
  bd: ClienteBD,
  tabela: string,
  coluna: string,
  valor: string,
): Promise<Record<string, unknown>[]> {
  const linhas: Record<string, unknown>[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await bd
      .from(tabela as "clientes")
      .select("*")
      .eq(coluna as "id", valor)
      .range(desde, desde + 999);
    if (error) falhaDeLeitura(tabela, error);
    linhas.push(...(data as Record<string, unknown>[]));
    if (data.length < 1000) return linhas;
  }
}
