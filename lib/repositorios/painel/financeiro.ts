import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Custos fixos e despesas da barbearia (E.2, só o gestor: RLS custos_gestor, despesas_gestor).

export type Conta = {
  id: string;
  tipo: "custo" | "despesa";
  descricao: string;
  valorCent: number;
  /** Vencimento (custo fixo) ou data (despesa). */
  data: string;
  pago: boolean;
  recorrente: boolean;
  categoria: string | null;
};

export async function listarCustos(
  bd: ClienteBD,
  inquilinoId: string,
  filtro: { de?: string; ate?: string; soPorPagar?: boolean } = {},
): Promise<Conta[]> {
  let q = bd
    .from("custos_fixos")
    .select("id, descricao, valor, vencimento, pago, recorrente")
    .eq("inquilino_id", inquilinoId)
    .order("vencimento");
  if (filtro.de) q = q.gte("vencimento", filtro.de);
  if (filtro.ate) q = q.lte("vencimento", filtro.ate);
  if (filtro.soPorPagar) q = q.eq("pago", false);
  const { data, error } = await q;
  if (error) falhaDeLeitura("custos_fixos", error);
  return data.map((c) => ({
    id: c.id,
    tipo: "custo",
    descricao: c.descricao,
    valorCent: centimosDeNumeric(c.valor),
    data: c.vencimento,
    pago: c.pago,
    recorrente: c.recorrente,
    categoria: null,
  }));
}

export async function listarDespesas(
  bd: ClienteBD,
  inquilinoId: string,
  filtro: { de?: string; ate?: string; soPorPagar?: boolean } = {},
): Promise<Conta[]> {
  let q = bd
    .from("despesas")
    .select("id, descricao, valor, data, pago, categoria")
    .eq("inquilino_id", inquilinoId)
    .order("data");
  if (filtro.de) q = q.gte("data", filtro.de);
  if (filtro.ate) q = q.lte("data", filtro.ate);
  if (filtro.soPorPagar) q = q.eq("pago", false);
  const { data, error } = await q;
  if (error) falhaDeLeitura("despesas", error);
  return data.map((d) => ({
    id: d.id,
    tipo: "despesa",
    descricao: d.descricao,
    valorCent: centimosDeNumeric(d.valor),
    data: d.data,
    pago: d.pago,
    recorrente: false,
    categoria: d.categoria,
  }));
}

export async function criarConta(
  bd: ClienteBD,
  inquilinoId: string,
  c: {
    tipo: "custo" | "despesa";
    descricao: string;
    valorCent: number;
    data: string;
    recorrente: boolean;
    categoria: string | null;
  },
): Promise<boolean> {
  const valor = numericParaGravar(c.valorCent);
  const { error } =
    c.tipo === "custo"
      ? await bd.from("custos_fixos").insert({
          inquilino_id: inquilinoId,
          descricao: c.descricao,
          valor,
          vencimento: c.data,
          recorrente: c.recorrente,
        })
      : await bd.from("despesas").insert({
          inquilino_id: inquilinoId,
          descricao: c.descricao,
          valor,
          data: c.data,
          categoria: c.categoria,
        });
  return !error;
}

/** «Paguei». Um custo fixo recorrente cria logo o do mês seguinte, por pagar. */
export async function marcarPaga(
  bd: ClienteBD,
  inquilinoId: string,
  tipo: "custo" | "despesa",
  id: string,
  proximoVencimento: (vencimento: string) => string,
): Promise<boolean> {
  const tabela = tipo === "custo" ? "custos_fixos" : "despesas";
  const { data, error } = await bd
    .from(tabela)
    .update({ pago: true, pago_em: new Date().toISOString() })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .eq("pago", false)
    .select("id");
  if (error || data.length === 0) return false;
  if (tipo === "custo") {
    const { data: c } = await bd
      .from("custos_fixos")
      .select("descricao, valor, vencimento, recorrente")
      .eq("id", id)
      .single();
    if (c?.recorrente) {
      await bd.from("custos_fixos").insert({
        inquilino_id: inquilinoId,
        descricao: c.descricao,
        valor: c.valor,
        vencimento: proximoVencimento(c.vencimento),
        recorrente: true,
      });
    }
  }
  return true;
}

export async function removerConta(
  bd: ClienteBD,
  inquilinoId: string,
  tipo: "custo" | "despesa",
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from(tipo === "custo" ? "custos_fixos" : "despesas")
    .delete()
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .select("id");
  return !error && data.length > 0;
}
