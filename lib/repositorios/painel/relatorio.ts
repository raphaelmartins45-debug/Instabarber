import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Leituras próprias do relatório mensal (E.5): mensagens de recuperação abertas, marcações do
// período (para a operação), movimentos de selos e o estado do clube. O RLS limita o barbeiro.

type Intervalo = { de: Date; ate: Date };

export async function recuperacoesAbertas(
  bd: ClienteBD,
  inquilinoId: string,
  intervalo: Intervalo,
  profissionalId: string | null,
): Promise<{ clienteId: string; abertaEm: string }[]> {
  let q = bd
    .from("mensagens")
    .select("cliente_id, aberta_em")
    .eq("inquilino_id", inquilinoId)
    .eq("tipo", "recuperacao")
    .eq("estado", "ligacao_aberta")
    .gte("aberta_em", intervalo.de.toISOString())
    .lt("aberta_em", intervalo.ate.toISOString());
  if (profissionalId) q = q.eq("profissional_id", profissionalId);
  const { data, error } = await q;
  if (error) falhaDeLeitura("mensagens", error);
  return data.flatMap((m) =>
    m.cliente_id && m.aberta_em ? [{ clienteId: m.cliente_id, abertaEm: m.aberta_em }] : [],
  );
}

export type MarcacaoOperacao = {
  estado: string;
  inicio: string;
  fim: string;
  criadoEm: string;
  profissionalId: string | null;
};

export async function marcacoesDoPeriodo(
  bd: ClienteBD,
  inquilinoId: string,
  intervalo: Intervalo,
  profissionalId: string | null,
): Promise<MarcacaoOperacao[]> {
  let q = bd
    .from("marcacoes")
    .select("estado, inicio, fim, criado_em, profissional_id")
    .eq("inquilino_id", inquilinoId)
    .in("estado", ["agendada", "concluida", "falta"])
    .gte("inicio", intervalo.de.toISOString())
    .lt("inicio", intervalo.ate.toISOString());
  if (profissionalId) q = q.eq("profissional_id", profissionalId);
  const { data, error } = await q;
  if (error) falhaDeLeitura("marcacoes", error);
  return data.map((m) => ({
    estado: m.estado,
    inicio: m.inicio,
    fim: m.fim,
    criadoEm: m.criado_em,
    profissionalId: m.profissional_id,
  }));
}

export async function movimentosSelos(
  bd: ClienteBD,
  inquilinoId: string,
  intervalo: Intervalo,
): Promise<{ tipo: string; quantidade: number; clienteId: string }[]> {
  const { data, error } = await bd
    .from("movimentos_selos")
    .select("tipo, quantidade, cliente_id")
    .eq("inquilino_id", inquilinoId)
    .gte("criado_em", intervalo.de.toISOString())
    .lt("criado_em", intervalo.ate.toISOString());
  if (error) falhaDeLeitura("movimentos_selos", error);
  return data.map((m) => ({ tipo: m.tipo, quantidade: m.quantidade, clienteId: m.cliente_id }));
}

/** Subscritores ativos e créditos por usar nos ciclos ainda em curso (bloco 7). */
export async function estadoClube(
  bd: ClienteBD,
  inquilinoId: string,
  hoje: string,
): Promise<{ subscritores: number; creditosPorUsar: number }> {
  const [{ count }, { data, error }] = await Promise.all([
    bd
      .from("subscricoes")
      .select("id", { count: "exact", head: true })
      .eq("inquilino_id", inquilinoId)
      .eq("estado", "ativa"),
    bd
      .from("creditos_clube")
      .select("quantidade, usados, ciclos_clube!inner(fim)")
      .eq("inquilino_id", inquilinoId)
      .gte("ciclos_clube.fim", hoje),
  ]);
  if (error) falhaDeLeitura("creditos_clube", error);
  return {
    subscritores: count ?? 0,
    creditosPorUsar: data.reduce((a, c) => a + c.quantidade - c.usados, 0),
  };
}
