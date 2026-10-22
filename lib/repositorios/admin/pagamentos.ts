import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Faturas que a Performa LAB emite fora da plataforma e recebimentos registados à mão (E.1).
// Sem cobrança automática (CLAUDE.md §3).

export type Fatura = {
  id: string;
  inquilino_id: string;
  numero: string;
  valor_centimos: number;
  periodo_inicio: string;
  periodo_fim: string;
  emitida_em: string;
  paga_em: string | null;
};

export type Recebimento = {
  id: string;
  inquilino_id: string;
  fatura_id: string | null;
  valor_centimos: number;
  metodo: "dinheiro" | "mbway" | "transferencia";
  data: string;
  nota: string | null;
};

export async function listarFaturas(bd: ClienteBD, inquilinoId?: string): Promise<Fatura[]> {
  let q = bd
    .from("faturas_plataforma")
    .select("*")
    .order("emitida_em", { ascending: false })
    .limit(200);
  if (inquilinoId) q = q.eq("inquilino_id", inquilinoId);
  const { data, error } = await q;
  if (error) falhaDeLeitura("faturas_plataforma", error);
  return data.map(({ valor, ...f }) => ({ ...f, valor_centimos: centimosDeNumeric(valor) }));
}

export async function listarRecebimentos(
  bd: ClienteBD,
  opcoes: { inquilinoId?: string; desde?: string } = {},
): Promise<Recebimento[]> {
  let q = bd
    .from("recebimentos")
    .select("id, inquilino_id, fatura_id, valor, metodo, data, nota")
    .order("data", { ascending: false })
    .limit(500);
  if (opcoes.inquilinoId) q = q.eq("inquilino_id", opcoes.inquilinoId);
  if (opcoes.desde) q = q.gte("data", opcoes.desde);
  const { data, error } = await q;
  if (error) falhaDeLeitura("recebimentos", error);
  return data.map(({ valor, metodo, ...r }) => ({
    ...r,
    metodo: metodo as Recebimento["metodo"],
    valor_centimos: centimosDeNumeric(valor),
  }));
}

export async function criarFatura(
  bd: ClienteBD,
  f: Omit<Fatura, "id" | "paga_em">,
): Promise<{ ok: true } | { ok: false; repetido: boolean }> {
  const { valor_centimos, ...resto } = f;
  const { error } = await bd
    .from("faturas_plataforma")
    .insert({ ...resto, valor: numericParaGravar(valor_centimos) });
  return error ? { ok: false, repetido: error.code === "23505" } : { ok: true };
}

/** Regista um recebimento; com fatura, marca-a como paga na mesma data. */
export async function registarRecebimento(
  bd: ClienteBD,
  r: Omit<Recebimento, "id"> & { registadoPor: string },
): Promise<boolean> {
  const { valor_centimos, registadoPor, ...resto } = r;
  const { error } = await bd
    .from("recebimentos")
    .insert({ ...resto, valor: numericParaGravar(valor_centimos), registado_por: registadoPor });
  if (error) return false;
  if (r.fatura_id)
    await bd
      .from("faturas_plataforma")
      .update({ paga_em: r.data })
      .eq("id", r.fatura_id)
      .is("paga_em", null);
  return true;
}
