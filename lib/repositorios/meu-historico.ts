import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";
import { assinarFotos, BUCKET_FICHAS } from "./painel/historico-cortes";

// O histórico de cortes visto pelo próprio cliente na sua área (D-179): só as entradas que a
// equipa marcou como visíveis, com a nota para o cliente (nunca a interna) e as fotografias, que
// ele vê com a sua sessão (RLS do Storage). O consentimento das fotografias muda aqui.

export type EntradaMeuHistorico = {
  id: string;
  data: string;
  servico: string | null;
  profissional: string | null;
  nota: string | null;
  fotoUrls: string[];
};

export async function meuHistoricoCortes(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<EntradaMeuHistorico[]> {
  const { data, error } = await bd.rpc("meu_historico_cortes", { p_inquilino: inquilinoId });
  if (error) falhaDeLeitura("meu_historico_cortes", error);
  const urls = await assinarFotos(
    bd,
    data.flatMap((e) => [e.foto_path, e.foto2_path].filter((x): x is string => !!x)),
  );
  return data.map((e) => ({
    id: e.id,
    data: e.data,
    servico: e.servico,
    profissional: e.profissional,
    nota: e.nota,
    fotoUrls: [e.foto_path, e.foto2_path].flatMap((c) => (c && urls.get(c) ? [urls.get(c)!] : [])),
  }));
}

/**
 * Dá ou retira o consentimento das fotografias. Ao retirar, apaga primeiro os ficheiros (com a
 * sessão do cliente, que o Storage autoriza enquanto as fichas os referem) e depois a base de
 * dados tira os caminhos das fichas.
 */
export async function mudarMeuConsentimentoFotos(
  bd: ClienteBD,
  inquilinoId: string,
  sim: boolean,
): Promise<boolean> {
  if (!sim) {
    const { data: caminhos, error } = await bd.rpc("minhas_fotos_historico", {
      p_inquilino: inquilinoId,
    });
    if (error) return false;
    if (caminhos.length) {
      const { error: erroApagar } = await bd.storage.from(BUCKET_FICHAS).remove(caminhos);
      if (erroApagar) return false;
    }
  }
  const { error } = await bd.rpc("mudar_consentimento_fotos", {
    p_inquilino: inquilinoId,
    p_sim: sim,
  });
  return !error;
}
