import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { Acerto } from "@/lib/regras/acertos";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Acertos mensais (F.4.11). Só o gestor regista; o barbeiro lê os seus. Um acerto liquidado não
// se reescreve (gatilho proteger_acerto): corrige-se com um acerto de tipo «correção».

export type RegistoAcerto = {
  id: string;
  profissionalId: string;
  mes: string;
  tipo: "normal" | "correcao";
  modelo: string;
  sentido: "a_pagar" | "a_receber";
  valorCent: number;
  metodo: string | null;
  liquidadoEm: string | null;
  nota: string | null;
};

export async function listarAcertos(
  bd: ClienteBD,
  inquilinoId: string,
  filtro: { mes?: string; profissionalId?: string } = {},
): Promise<RegistoAcerto[]> {
  let q = bd
    .from("acertos")
    .select(
      "id, profissional_id, mes_referencia, tipo, modelo, sentido, valor_liquidado, metodo, liquidado_em, nota",
    )
    .eq("inquilino_id", inquilinoId)
    .order("mes_referencia", { ascending: false })
    .order("criado_em", { ascending: false });
  if (filtro.mes) q = q.eq("mes_referencia", filtro.mes);
  if (filtro.profissionalId) q = q.eq("profissional_id", filtro.profissionalId);
  const { data, error } = await q;
  if (error) falhaDeLeitura("acertos", error);
  return data.map((a) => ({
    id: a.id,
    profissionalId: a.profissional_id,
    mes: a.mes_referencia,
    tipo: a.tipo as RegistoAcerto["tipo"],
    modelo: a.modelo,
    sentido: a.sentido as RegistoAcerto["sentido"],
    valorCent: a.valor_liquidado === null ? 0 : centimosDeNumeric(a.valor_liquidado),
    metodo: a.metodo,
    liquidadoEm: a.liquidado_em,
    nota: a.nota,
  }));
}

/**
 * «Registar acerto»: o primeiro do mês é o normal, com o retrato do acerto; os seguintes são
 * correções (pagamento parcial ou acerto de sinal contrário). Fica logo liquidado.
 */
export async function registarAcerto(
  bd: ClienteBD,
  d: {
    inquilinoId: string;
    profissionalId: string;
    mes: string;
    acerto: Acerto;
    sentido: "a_pagar" | "a_receber";
    valorCent: number;
    metodo: string;
    data: string;
    nota: string | null;
    primeiro: boolean;
  },
): Promise<boolean> {
  const { error } = await bd.from("acertos").insert({
    inquilino_id: d.inquilinoId,
    profissional_id: d.profissionalId,
    mes_referencia: d.mes,
    tipo: d.primeiro ? "normal" : "correcao",
    modelo: d.acerto.modelo,
    receita: numericParaGravar(d.acerto.receitaCent),
    parte_barbeiro: numericParaGravar(d.acerto.aPagarCent),
    parte_barbearia: numericParaGravar(d.acerto.aReceberCent),
    sentido: d.sentido,
    estado: "liquidado",
    valor_liquidado: numericParaGravar(d.valorCent),
    metodo: d.metodo,
    liquidado_em: new Date(`${d.data}T12:00:00Z`).toISOString(),
    nota: d.nota,
  });
  return !error;
}
