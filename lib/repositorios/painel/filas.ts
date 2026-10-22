import type { ClienteBD } from "@/lib/supabase/tipos";
import { falhaDeLeitura } from "../erros";

// Filas no painel (F.4.1, F.4.3). O aviso com o prazo de 30 minutos passa pela função
// avisar_fila_espera(); o resto são mudanças de estado protegidas por RLS.

export type EntradaEspera = {
  id: string;
  clienteId: string;
  cliente: string;
  telefone: string | null;
  servicoId: string;
  servico: string;
  estado: "aguarda" | "avisado" | "expirado";
  expiraEm: string | null;
};

export async function listarFilaEspera(
  bd: ClienteBD,
  inquilinoId: string,
  dia: string,
  agora: Date = new Date(),
): Promise<EntradaEspera[]> {
  const { data, error } = await bd
    .from("fila_espera")
    .select("id, estado, expira_em, servico_id, clientes(id, nome, telefone), servicos(nome)")
    .eq("inquilino_id", inquilinoId)
    .eq("dia", dia)
    .in("estado", ["aguarda", "avisado"])
    .order("criado_em");
  if (error) falhaDeLeitura("fila_espera", error);
  return data.map((e) => ({
    id: e.id,
    clienteId: e.clientes?.id ?? "",
    cliente: e.clientes?.nome ?? "",
    telefone: e.clientes?.telefone ?? null,
    servicoId: e.servico_id,
    servico: e.servicos?.nome ?? "",
    // O «expirado» calcula-se na leitura: não há tarefas agendadas (F.4.1).
    estado:
      e.estado === "avisado" && e.expira_em && new Date(e.expira_em) <= agora
        ? "expirado"
        : (e.estado as "aguarda" | "avisado"),
    expiraEm: e.expira_em,
  }));
}

export async function avisarFilaEspera(bd: ClienteBD, entradaId: string): Promise<boolean> {
  const { error } = await bd.rpc("avisar_fila_espera", { p_entrada: entradaId });
  return !error;
}

export async function mudarEstadoEspera(
  bd: ClienteBD,
  entradaId: string,
  estado: "aceite" | "expirado" | "removido",
): Promise<boolean> {
  const { data, error } = await bd
    .from("fila_espera")
    .update({ estado })
    .eq("id", entradaId)
    .select("id");
  return !error && data.length === 1;
}

export type EntradaPresencial = {
  id: string;
  cliente: string;
  semConta: boolean;
  servico: string | null;
  estado: "aguarda" | "em_atendimento";
  profissionalId: string | null;
  profissional: string | null;
  entrouEm: string;
};

export async function listarFilaPresencial(
  bd: ClienteBD,
  inquilinoId: string,
  dia: string,
): Promise<EntradaPresencial[]> {
  const { data, error } = await bd
    .from("fila_presencial")
    .select(
      "id, estado, entrou_em, profissional_id, clientes(nome, auth_user_id), servicos(nome), profissionais(nome_apresentado, nome)",
    )
    .eq("inquilino_id", inquilinoId)
    .eq("dia", dia)
    .in("estado", ["aguarda", "em_atendimento"])
    .order("entrou_em");
  if (error) falhaDeLeitura("fila_presencial", error);
  return data.map((e) => ({
    id: e.id,
    cliente: e.clientes?.nome ?? "",
    semConta: !e.clientes?.auth_user_id,
    servico: e.servicos?.nome ?? null,
    estado: e.estado as "aguarda" | "em_atendimento",
    profissionalId: e.profissional_id,
    profissional: e.profissionais ? e.profissionais.nome_apresentado || e.profissionais.nome : null,
    entrouEm: e.entrou_em,
  }));
}

export async function mudarEstadoPresencial(
  bd: ClienteBD,
  entradaId: string,
  estado: "em_atendimento" | "atendido" | "saiu",
  profissionalId: string | null,
): Promise<boolean> {
  const { data, error } = await bd
    .from("fila_presencial")
    .update(
      estado === "em_atendimento"
        ? { estado, profissional_id: profissionalId, chamado_em: new Date().toISOString() }
        : { estado },
    )
    .eq("id", entradaId)
    .select("id");
  return !error && data.length === 1;
}
