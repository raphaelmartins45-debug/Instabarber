import type { ClienteBD } from "@/lib/supabase/tipos";

// Verificação de saúde (D-156): a base de dados responde a uma leitura pública mínima.
// Usada por /api/saude, que o serviço de monitorização consulta para medir a disponibilidade.

export async function baseDeDadosResponde(bd: ClienteBD): Promise<boolean> {
  const { error } = await bd
    .from("funcionalidades")
    .select("chave", { head: true, count: "exact" });
  return !error;
}
