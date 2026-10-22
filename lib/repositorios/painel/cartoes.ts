import { centimosDeNumeric, numericParaGravar } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Cartões oferta (F.4.9). Vender e usar só pelas funções vender_cartao_oferta() e
// usar_cartao_oferta(), que verificam validade e saldo (D-121).

export type Cartao = {
  id: string;
  codigo: string;
  valorInicialCent: number;
  saldoCent: number;
  comprador: string;
  beneficiario: string | null;
  vendidoEm: string;
  validoAte: string;
  anuladoEm: string | null;
  metodo: string | null;
};

const motivo = (m: string) => m.match(/^[a-z_]+$/)?.[0] ?? "erro";

export async function listarCartoes(bd: ClienteBD, inquilinoId: string): Promise<Cartao[]> {
  const [cartoes, saldos] = await Promise.all([
    bd
      .from("cartoes_oferta")
      .select(
        "id, codigo, valor_inicial, comprador_nome, beneficiario_nome, vendido_em, valido_ate, anulado_em, metodo",
      )
      .eq("inquilino_id", inquilinoId)
      .order("vendido_em", { ascending: false }),
    bd.from("saldo_cartoes").select("cartao_id, saldo").eq("inquilino_id", inquilinoId),
  ]);
  if (cartoes.error) falhaDeLeitura("cartoes_oferta", cartoes.error);
  if (saldos.error) falhaDeLeitura("saldo_cartoes", saldos.error);
  const saldo = new Map(saldos.data.map((s) => [s.cartao_id, s.saldo ?? 0]));
  return cartoes.data.map((c) => ({
    id: c.id,
    codigo: c.codigo,
    valorInicialCent: centimosDeNumeric(c.valor_inicial),
    saldoCent: centimosDeNumeric(saldo.get(c.id) ?? c.valor_inicial),
    comprador: c.comprador_nome,
    beneficiario: c.beneficiario_nome,
    vendidoEm: c.vendido_em,
    validoAte: c.valido_ate,
    anuladoEm: c.anulado_em,
    metodo: c.metodo,
  }));
}

/** Saldo de um cartão pelo código, se estiver válido hoje (a função de uso volta a verificar). */
export async function saldoValido(
  bd: ClienteBD,
  inquilinoId: string,
  codigo: string,
  hoje: string,
): Promise<number | null> {
  const { data, error } = await bd
    .from("saldo_cartoes")
    .select("saldo, valido_ate, anulado_em")
    .eq("inquilino_id", inquilinoId)
    .eq("codigo", codigo.trim().toUpperCase())
    .maybeSingle();
  if (error) falhaDeLeitura("saldo_cartoes", error);
  if (!data || data.anulado_em || !data.valido_ate || data.valido_ate < hoje) return null;
  return centimosDeNumeric(data.saldo ?? 0);
}

export async function venderCartao(
  bd: ClienteBD,
  d: {
    inquilinoId: string;
    valorCent: number;
    comprador: string;
    beneficiario: string | null;
    metodo: string;
    validoAte: string | null;
  },
): Promise<{ ok: true; id: string } | { ok: false; motivo: string }> {
  const { data, error } = await bd.rpc("vender_cartao_oferta", {
    p_inquilino: d.inquilinoId,
    p_valor: numericParaGravar(d.valorCent),
    p_comprador: d.comprador,
    p_beneficiario: d.beneficiario ?? undefined,
    p_metodo: d.metodo,
    p_valido_ate: d.validoAte ?? undefined,
  });
  return error ? { ok: false, motivo: motivo(error.message) } : { ok: true, id: data };
}

export async function usarCartao(
  bd: ClienteBD,
  d: { inquilinoId: string; codigo: string; valorCent: number; marcacaoId: string | null },
): Promise<{ ok: true; saldoCent: number } | { ok: false; motivo: string }> {
  const { data, error } = await bd.rpc("usar_cartao_oferta", {
    p_inquilino: d.inquilinoId,
    p_codigo: d.codigo,
    p_valor: numericParaGravar(d.valorCent),
    p_marcacao: d.marcacaoId ?? undefined,
  });
  return error
    ? { ok: false, motivo: motivo(error.message) }
    : { ok: true, saldoCent: centimosDeNumeric(data) };
}

export async function anularCartao(
  bd: ClienteBD,
  inquilinoId: string,
  id: string,
): Promise<boolean> {
  const { data, error } = await bd
    .from("cartoes_oferta")
    .update({ anulado_em: new Date().toISOString() })
    .eq("inquilino_id", inquilinoId)
    .eq("id", id)
    .is("anulado_em", null)
    .select("id");
  return !error && data.length > 0;
}
