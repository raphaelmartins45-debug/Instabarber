import type { Campanha, CampanhaDaBarbearia } from "@/lib/comercial/campanhas";
import type { Implementacao } from "@/lib/comercial/condicoes";
import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Campanhas comerciais (D-190). Os administradores alteram; o comercial lê (RLS). A barbearia lê
// só a sua, pela função campanha_da_barbearia().

export async function listarCampanhas(bd: ClienteBD): Promise<Campanha[]> {
  const { data, error } = await bd.from("campanhas_comerciais").select("*").order("ordem");
  if (error) falhaDeLeitura("campanhas_comerciais", error);
  // As vagas usadas contam-se nas barbearias; o comercial não as vê (a base de dados confere).
  const { data: usos } = await bd
    .from("inquilinos")
    .select("campanha_id")
    .not("campanha_id", "is", null);
  const usadas = new Map<string, number>();
  for (const u of usos ?? []) usadas.set(u.campanha_id!, (usadas.get(u.campanha_id!) ?? 0) + 1);
  return data.map((c) => ({
    id: c.id,
    chave: c.chave,
    nome: c.nome,
    texto: c.texto,
    ativa: c.ativa,
    valida_ate: c.valida_ate,
    vagas: c.vagas,
    usadas: usadas.get(c.id) ?? 0,
    planos: c.planos,
    periodicidade: c.periodicidade as Campanha["periodicidade"],
    implementacao: c.implementacao as Implementacao | null,
    implementacaoCent:
      c.implementacao_sem_iva === null ? null : centimosDeNumeric(c.implementacao_sem_iva),
    meses_oferta: c.meses_oferta,
    primeiro_mes_gratis: c.primeiro_mes_gratis,
    meses_condicao: c.meses_condicao,
    desconto_temporario_pct: Number(c.desconto_temporario_pct),
    profissionais_gratis: c.profissionais_gratis,
    dominio_gratis: c.dominio_gratis,
  }));
}

export type AlteracaoCampanha = {
  ativa: boolean;
  nome: string;
  texto: string;
  valida_ate: string | null;
  vagas: number | null;
};

export async function alterarCampanha(
  bd: ClienteBD,
  id: string,
  a: AlteracaoCampanha,
): Promise<boolean> {
  const { data, error } = await bd.from("campanhas_comerciais").update(a).eq("id", id).select("id");
  return !error && data.length === 1;
}

export type CampanhaDaPropriaBarbearia = CampanhaDaBarbearia & { nome: string; texto: string };

/** A campanha da barbearia (para «O meu plano» e para conferir o pagamento), ou nula. */
export async function campanhaDaBarbearia(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<CampanhaDaPropriaBarbearia | null> {
  const { data, error } = await bd.rpc("campanha_da_barbearia", { p_inquilino: inquilinoId });
  if (error) falhaDeLeitura("campanha_da_barbearia", error);
  const c = data?.[0];
  return c ? { ...c, desconto_temporario_pct: Number(c.desconto_temporario_pct) } : null;
}
