import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Serviços prestados (visitas), criados só por concluir_marcacao(). O RLS deixa o barbeiro
// ler só as suas.

export type Visita = {
  id: string;
  /** A marcação concluída que deu origem à visita (o histórico de cortes liga-se a ela). */
  marcacaoId: string;
  clienteId: string;
  profissionalId: string | null;
  servicoId: string;
  data: string;
  valorTabelaCent: number;
  valorCobradoCent: number;
  comissaoPercent: number;
  comissaoCent: number;
  modelo: "A" | "B" | "C";
  /** O serviço saiu de um crédito do clube. */
  clube: boolean;
};

const COLUNAS = `id, marcacao_id, cliente_id, profissional_id, servico_id, data, valor_tabela, valor_cobrado,
  comissao_percent, comissao_valor, modelo_caixa, marcacoes(credito_id)`;

type Linha = {
  id: string;
  marcacao_id: string;
  cliente_id: string;
  profissional_id: string | null;
  servico_id: string;
  data: string;
  valor_tabela: number;
  valor_cobrado: number;
  comissao_percent: number;
  comissao_valor: number;
  modelo_caixa: string;
  marcacoes: { credito_id: string | null } | null;
};

const paraVisita = (l: Linha): Visita => ({
  id: l.id,
  marcacaoId: l.marcacao_id,
  clienteId: l.cliente_id,
  profissionalId: l.profissional_id,
  servicoId: l.servico_id,
  data: l.data,
  valorTabelaCent: centimosDeNumeric(l.valor_tabela),
  valorCobradoCent: centimosDeNumeric(l.valor_cobrado),
  comissaoPercent: Number(l.comissao_percent),
  comissaoCent: centimosDeNumeric(l.comissao_valor),
  modelo: l.modelo_caixa as Visita["modelo"],
  clube: !!l.marcacoes?.credito_id,
});

/** Visitas num intervalo, opcionalmente de um profissional ou de um cliente. */
export async function listarVisitas(
  bd: ClienteBD,
  inquilinoId: string,
  filtro: { de?: Date; ate?: Date; profissionalId?: string | null; clienteId?: string } = {},
): Promise<Visita[]> {
  let q = bd.from("visitas").select(COLUNAS).eq("inquilino_id", inquilinoId).order("data");
  if (filtro.de) q = q.gte("data", filtro.de.toISOString());
  if (filtro.ate) q = q.lt("data", filtro.ate.toISOString());
  if (filtro.profissionalId) q = q.eq("profissional_id", filtro.profissionalId);
  if (filtro.clienteId) q = q.eq("cliente_id", filtro.clienteId);
  const { data, error } = await q;
  if (error) falhaDeLeitura("visitas", error);
  return (data as unknown as Linha[]).map(paraVisita);
}

export type VisitaResumida = {
  clienteId: string;
  profissionalId: string | null;
  servicoId: string;
  data: string;
  valorCobradoCent: number;
};

/** Todas as visitas (só as colunas da classificação), para o radar de clientes. */
export async function listarVisitasParaRadar(
  bd: ClienteBD,
  inquilinoId: string,
  profissionalId: string | null,
): Promise<VisitaResumida[]> {
  let q = bd
    .from("visitas")
    .select("cliente_id, profissional_id, servico_id, data, valor_cobrado")
    .eq("inquilino_id", inquilinoId);
  if (profissionalId) q = q.eq("profissional_id", profissionalId);
  const { data, error } = await q;
  if (error) falhaDeLeitura("visitas", error);
  return data.map((v) => ({
    clienteId: v.cliente_id,
    profissionalId: v.profissional_id,
    servicoId: v.servico_id,
    data: v.data,
    valorCobradoCent: centimosDeNumeric(v.valor_cobrado),
  }));
}
