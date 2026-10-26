import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";

// Comprovativos de pagamento da mensalidade (D-168). O RLS mostra ao dono os da sua barbearia
// (também suspensa) e ao super_admin todos; escreve-se só pelas funções SQL, que validam tudo.

export const BUCKET_COMPROVATIVOS = "comprovativos";

export type Comprovativo = {
  id: string;
  inquilino_id: string;
  fatura_id: string | null;
  periodo_inicio: string;
  periodo_fim: string;
  metodo: "mbway" | "transferencia";
  valor_centimos: number;
  pago_em: string;
  caminho: string;
  estado: "pendente" | "aprovado" | "recusado";
  motivo: string | null;
  enviado_em: string;
};

export type PeriodoAPagar = {
  inicio: string;
  fim: string;
  faturaId: string | null;
  valorFaturaCent: number | null;
};

const COLUNAS =
  "id, inquilino_id, fatura_id, periodo_inicio, periodo_fim, metodo, valor, pago_em, caminho, estado, motivo, enviado_em";

type Linha = Omit<Comprovativo, "valor_centimos" | "metodo" | "estado"> & {
  valor: number | string;
  metodo: string;
  estado: string;
};
const deLinha = ({ valor, metodo, estado, ...c }: Linha): Comprovativo => ({
  ...c,
  metodo: metodo as Comprovativo["metodo"],
  estado: estado as Comprovativo["estado"],
  valor_centimos: centimosDeNumeric(valor),
});

export async function listarComprovativos(
  bd: ClienteBD,
  opcoes: { inquilinoId?: string; estado?: Comprovativo["estado"] } = {},
): Promise<Comprovativo[]> {
  let q = bd
    .from("comprovativos_pagamento")
    .select(COLUNAS)
    .order("enviado_em", { ascending: false })
    .limit(200);
  if (opcoes.inquilinoId) q = q.eq("inquilino_id", opcoes.inquilinoId);
  if (opcoes.estado) q = q.eq("estado", opcoes.estado);
  const { data, error } = await q;
  if (error) falhaDeLeitura("comprovativos_pagamento", error);
  return data.map(deLinha);
}

export async function obterComprovativo(bd: ClienteBD, id: string): Promise<Comprovativo | null> {
  const { data, error } = await bd
    .from("comprovativos_pagamento")
    .select(COLUNAS)
    .eq("id", id)
    .maybeSingle();
  if (error) falhaDeLeitura("comprovativos_pagamento", error);
  return data ? deLinha(data) : null;
}

/** O período que a barbearia está a pagar (fatura por pagar ou próximo vencimento). */
export async function periodoAPagar(bd: ClienteBD, inquilinoId: string): Promise<PeriodoAPagar> {
  const { data, error } = await bd.rpc("periodo_a_pagar", { p_inquilino: inquilinoId });
  if (error || !data?.[0]) falhaDeLeitura("periodo_a_pagar", error ?? { message: "vazio" });
  const p = data[0];
  return {
    inicio: p.inicio,
    fim: p.fim,
    faturaId: p.fatura_id,
    valorFaturaCent: p.valor_fatura === null ? null : centimosDeNumeric(p.valor_fatura),
  };
}

/** Regista o comprovativo já carregado; devolve o id ou o código do erro da base de dados. */
export async function enviarComprovativo(
  bd: ClienteBD,
  c: { inquilinoId: string; metodo: string; valorCent: number; pagoEm: string; caminho: string },
): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  const { data, error } = await bd.rpc("enviar_comprovativo", {
    p_inquilino: c.inquilinoId,
    p_metodo: c.metodo,
    p_valor: numericParaGravar(c.valorCent),
    p_pago_em: c.pagoEm,
    p_caminho: c.caminho,
  });
  return error ? { ok: false, erro: error.message } : { ok: true, id: data };
}

export async function aprovarComprovativo(
  bd: ClienteBD,
  id: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const { error } = await bd.rpc("aprovar_comprovativo", { p_id: id });
  return error ? { ok: false, erro: error.message } : { ok: true };
}

export async function recusarComprovativo(
  bd: ClienteBD,
  id: string,
  motivo: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const { error } = await bd.rpc("recusar_comprovativo", { p_id: id, p_motivo: motivo });
  return error ? { ok: false, erro: error.message } : { ok: true };
}

/** Ligação temporária (10 minutos) para o super_admin ou o dono abrirem o ficheiro. */
export async function urlDoComprovativo(bd: ClienteBD, caminho: string): Promise<string | null> {
  const { data } = await bd.storage.from(BUCKET_COMPROVATIVOS).createSignedUrl(caminho, 600);
  return data?.signedUrl ?? null;
}
