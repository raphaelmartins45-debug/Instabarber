import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";

// Marcação pública (F.7, E.4): só pelas funções vagas_livres(), reservar_vaga() e
// confirmar_reserva(). A base de dados decide a vaga, o preço, as faltas e o limite.

export type VagaPublica = {
  inicio: string;
  profissionalId: string;
  valorTabelaCent: number;
  descontoPercent: number;
  valorCobradoCent: number;
};

const motivo = (m: string) => m.match(/^[a-z_]+$/)?.[0] ?? "erro";

export async function vagasPublicas(
  bd: ClienteBD,
  inquilinoId: string,
  servicoId: string,
  dia: string,
  profissionalId: string | null,
): Promise<VagaPublica[]> {
  const { data, error } = await bd.rpc("vagas_livres", {
    p_inquilino: inquilinoId,
    p_servico: servicoId,
    p_dia: dia,
    p_profissional: profissionalId ?? undefined,
    p_publico: true,
  });
  if (error) falhaDeLeitura("vagas_livres", error);
  return data.map((v) => ({
    inicio: v.inicio,
    profissionalId: v.profissional_id,
    valorTabelaCent: centimosDeNumeric(v.valor_tabela),
    descontoPercent: Number(v.desconto_percent),
    valorCobradoCent: centimosDeNumeric(v.valor_cobrado),
  }));
}

export type Reserva = {
  marcacaoId: string;
  token: string;
  reservadaAte: string;
  profissionalId: string;
  valorTabelaCent: number;
  valorCobradoCent: number;
};

export async function reservarVaga(
  bd: ClienteBD,
  d: { inquilinoId: string; servicoId: string; inicio: string; profissionalId: string | null },
): Promise<{ ok: true; reserva: Reserva } | { ok: false; motivo: string }> {
  const { data, error } = await bd.rpc("reservar_vaga", {
    p_inquilino: d.inquilinoId,
    p_servico: d.servicoId,
    p_inicio: d.inicio,
    p_profissional: d.profissionalId ?? undefined,
  });
  if (error)
    return { ok: false, motivo: error.code === "23P01" ? "ocupado" : motivo(error.message) };
  const r = data[0];
  if (!r) return { ok: false, motivo: "ocupado" };
  return {
    ok: true,
    reserva: {
      marcacaoId: r.marcacao_id,
      token: r.token,
      reservadaAte: r.reservada_ate,
      profissionalId: r.profissional_id,
      valorTabelaCent: centimosDeNumeric(r.valor_tabela),
      valorCobradoCent: centimosDeNumeric(r.valor_cobrado),
    },
  };
}

export async function confirmarReserva(
  bd: ClienteBD,
  d: {
    marcacaoId: string;
    token: string;
    nome: string;
    telefone: string;
    email: string | null;
    nascimento: string | null;
    consentimento: boolean;
    convite: string | null;
  },
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const { error } = await bd.rpc("confirmar_reserva", {
    p_marcacao: d.marcacaoId,
    p_token: d.token,
    p_nome: d.nome,
    p_telefone: d.telefone,
    p_email: d.email ?? undefined,
    p_data_nascimento: d.nascimento ?? undefined,
    p_consentimento: d.consentimento,
    p_codigo_convite: d.convite ?? undefined,
  });
  return error ? { ok: false, motivo: motivo(error.message) } : { ok: true };
}

/** Com a chave de serviço: o cliente da marcação confirmada e se pode criar o acesso sem código (F.9). */
export async function clienteParaAcessoDireto(
  servico: ClienteBD,
  marcacaoId: string,
): Promise<{ clienteId: string; authUserId: string | null; direto: boolean } | null> {
  const { data } = await servico
    .from("marcacoes")
    .select("cliente_id, clientes(auth_user_id)")
    .eq("id", marcacaoId)
    .maybeSingle();
  if (!data?.cliente_id) return null;
  const { data: direto } = await servico.rpc("pode_criar_acesso_direto", {
    p_cliente: data.cliente_id,
  });
  return {
    clienteId: data.cliente_id,
    authUserId: data.clientes?.auth_user_id ?? null,
    direto: direto === true,
  };
}
