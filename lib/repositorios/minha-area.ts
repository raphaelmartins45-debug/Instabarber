import { centimosDeNumeric } from "@/lib/formatacao/dinheiro";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "./erros";

// A área de cliente (E.4): o cliente lê só os seus dados (RLS meus_clientes) e os nomes dos
// serviços e dos barbeiros pelas vistas públicas.

export type CartaoSelos = { selos: number; necessarios: number; premio: string | null };

export async function meuCartaoSelos(
  bd: ClienteBD,
  inquilinoId: string,
): Promise<CartaoSelos | null> {
  const { data, error } = await bd.rpc("meu_cartao_selos", { p_inquilino: inquilinoId });
  if (error) falhaDeLeitura("meu_cartao_selos", error);
  const c = data[0];
  return c ? { selos: c.selos, necessarios: c.necessarios, premio: c.premio } : null;
}

export async function meuCodigoConvite(bd: ClienteBD, inquilinoId: string): Promise<string | null> {
  const { data, error } = await bd.rpc("meu_codigo_convite", { p_inquilino: inquilinoId });
  return error ? null : data;
}

export type MinhaMarcacao = {
  id: string;
  inicio: string;
  servicoId: string;
  profissionalId: string | null;
  valorCent: number;
};

export async function minhasMarcacoesFuturas(
  bd: ClienteBD,
  clienteId: string,
): Promise<MinhaMarcacao[]> {
  const { data, error } = await bd
    .from("marcacoes")
    .select("id, inicio, servico_id, profissional_id, valor_cobrado")
    .eq("cliente_id", clienteId)
    .eq("estado", "agendada")
    .gt("inicio", new Date().toISOString())
    .order("inicio");
  if (error) falhaDeLeitura("marcacoes", error);
  return data.map((m) => ({
    id: m.id,
    inicio: m.inicio,
    servicoId: m.servico_id,
    profissionalId: m.profissional_id,
    valorCent: centimosDeNumeric(m.valor_cobrado),
  }));
}

export type MinhaVisita = {
  id: string;
  data: string;
  servicoId: string;
  profissionalId: string | null;
  valorCent: number;
};

export async function minhasVisitas(bd: ClienteBD, clienteId: string): Promise<MinhaVisita[]> {
  const { data, error } = await bd
    .from("visitas")
    .select("id, data, servico_id, profissional_id, valor_cobrado")
    .eq("cliente_id", clienteId)
    .order("data", { ascending: false })
    .limit(50);
  if (error) falhaDeLeitura("visitas", error);
  return data.map((v) => ({
    id: v.id,
    data: v.data,
    servicoId: v.servico_id,
    profissionalId: v.profissional_id,
    valorCent: centimosDeNumeric(v.valor_cobrado),
  }));
}

export type MeuPlano = {
  clube: string;
  proximaRenovacao: string;
  creditos: { servicoId: string; quantidade: number; usados: number }[];
};

export async function meusPlanos(
  bd: ClienteBD,
  clienteId: string,
  hoje: string,
): Promise<MeuPlano[]> {
  const { data, error } = await bd
    .from("subscricoes")
    .select(
      "proxima_renovacao, estado, clubes(nome), ciclos_clube(inicio, fim, pago_em, creditos_clube(servico_id, quantidade, usados))",
    )
    .eq("cliente_id", clienteId)
    .eq("estado", "ativa");
  if (error) falhaDeLeitura("subscricoes", error);
  return data.map((s) => {
    const atual = s.ciclos_clube.find((c) => c.inicio <= hoje && c.fim > hoje && c.pago_em);
    return {
      clube: s.clubes?.nome ?? "",
      proximaRenovacao: s.proxima_renovacao,
      creditos: (atual?.creditos_clube ?? []).map((c) => ({
        servicoId: c.servico_id,
        quantidade: c.quantidade,
        usados: c.usados,
      })),
    };
  });
}

export type MinhaEncomenda = {
  id: string;
  numero: number;
  estado: string;
  totalCent: number;
  criadoEm: string;
};

export async function minhasEncomendas(
  bd: ClienteBD,
  clienteId: string,
): Promise<MinhaEncomenda[]> {
  const { data, error } = await bd
    .from("pedidos_loja")
    .select("id, numero, estado, total, criado_em")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false })
    .limit(20);
  if (error) falhaDeLeitura("pedidos_loja", error);
  return data.map((p) => ({
    id: p.id,
    numero: p.numero,
    estado: p.estado,
    totalCent: centimosDeNumeric(p.total),
    criadoEm: p.criado_em,
  }));
}

export async function cancelarMinhaMarcacao(
  bd: ClienteBD,
  id: string,
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  const { error } = await bd.rpc("cancelar_minha_marcacao", { p_marcacao: id });
  return error
    ? { ok: false, motivo: error.message.match(/^[a-z_]+$/)?.[0] ?? "erro" }
    : { ok: true };
}
