import type { ClienteImportado } from "@/lib/regras/importacao";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Clientes de uma barbearia para a importação do Admin (E.1). O super_admin com dois fatores
// cria clientes (clientes_admin_criar), sem consentimento para mensagens (H.1).

export async function telefonesExistentes(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<Set<string>> {
  const telefones = new Set<string>();
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await bd
      .from("clientes")
      .select("telefone")
      .eq("inquilino_id", inquilinoId)
      .not("telefone", "is", null)
      .range(desde, desde + 999);
    if (error) falhaDeLeitura("clientes", error);
    data.forEach((c) => c.telefone && telefones.add(c.telefone));
    if (data.length < 1000) return telefones;
  }
}

export async function importarClientes(
  bd: ClienteBD,
  inquilinoId: string,
  clientes: ClienteImportado[],
): Promise<number> {
  let gravados = 0;
  for (let i = 0; i < clientes.length; i += 500) {
    const lote = clientes.slice(i, i + 500).map((c) => ({
      ...c,
      inquilino_id: inquilinoId,
      origem: "importacao",
      consentimento_mensagens: false,
    }));
    const { error } = await bd.from("clientes").insert(lote);
    if (error) break;
    gravados += lote.length;
  }
  return gravados;
}
