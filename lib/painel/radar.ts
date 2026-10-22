import "server-only";
import {
  classificar,
  faturacaoARecuperar,
  ticketMedio,
  type Classificacao,
  type EstadoCliente,
} from "@/lib/regras/classificacao";
import { listarClientes, saldosSelos, type Cliente } from "@/lib/repositorios/painel/clientes";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { listarVisitasParaRadar } from "@/lib/repositorios/painel/visitas";
import type { ClienteBD } from "@/lib/supabase/tipos";

// Radar de clientes (E.2, F.1). No painel do barbeiro só conta o histórico com ele; no do gestor,
// o da barbearia inteira (quem mudou de barbeiro não está perdido).

export type LinhaRadar = {
  cliente: Cliente;
  classificacao: Classificacao;
  ticketMedioCent: number;
  visitas: number;
  ultimoServico: string | null;
  selos: number;
  /** Entrou por QR, loja ou fila e não tem conta (E.2). */
  naoRegistado: boolean;
  /** Pode receber mensagens promocionais (consentimento, sem «não contactar», não anonimizado). */
  contactavel: boolean;
};

export type Radar = {
  linhas: LinhaRadar[];
  perdidos: number;
  emRisco: number;
  aRecuperarCent: number;
  ticketMedioCent: number;
};

export async function radarClientes(
  bd: ClienteBD,
  inquilinoId: string,
  profissionalId: string | null,
  agora: Date = new Date(),
): Promise<Radar> {
  const [clientes, visitas, servicos, selos] = await Promise.all([
    listarClientes(bd, inquilinoId),
    listarVisitasParaRadar(bd, inquilinoId, profissionalId),
    listarServicos(bd, inquilinoId, false),
    saldosSelos(bd, inquilinoId),
  ]);
  const nomeServico = new Map(servicos.map((s) => [s.id, s.nome]));
  const porCliente = new Map<string, typeof visitas>();
  visitas.forEach((v) => porCliente.set(v.clienteId, [...(porCliente.get(v.clienteId) ?? []), v]));

  const linhas = clientes.map((c): LinhaRadar => {
    const minhas = (porCliente.get(c.id) ?? []).sort((a, b) => a.data.localeCompare(b.data));
    const ultima = minhas[minhas.length - 1];
    return {
      cliente: c,
      classificacao: classificar(
        minhas.map((v) => v.data),
        agora,
      ),
      ticketMedioCent: ticketMedio(minhas.map((v) => v.valorCobradoCent)),
      visitas: minhas.length,
      ultimoServico: ultima ? (nomeServico.get(ultima.servicoId) ?? null) : null,
      selos: selos.get(c.id) ?? 0,
      naoRegistado: ["qr", "loja", "fila"].includes(c.origem) && !c.auth_user_id,
      contactavel: c.consentimento_mensagens && !c.nao_contactar && !c.anonimizado_em,
    };
  });
  const conta = (e: EstadoCliente) => linhas.filter((l) => l.classificacao.estado === e).length;
  return {
    linhas,
    perdidos: conta("perdido"),
    emRisco: conta("em_risco"),
    aRecuperarCent: faturacaoARecuperar(
      linhas.map((l) => ({ estado: l.classificacao.estado, ticketMedioCent: l.ticketMedioCent })),
    ),
    ticketMedioCent: ticketMedio(visitas.map((v) => v.valorCobradoCent)),
  };
}

/** Filtros do radar (E.2): ativos, em risco, perdidos, sem histórico, não registados. */
export type FiltroRadar = EstadoCliente | "nao_registados" | "todos";

export function filtrarRadar(
  linhas: LinhaRadar[],
  filtro: FiltroRadar,
  busca: string,
): LinhaRadar[] {
  const q = busca.trim().toLowerCase();
  return linhas.filter((l) => {
    if (filtro === "nao_registados" && !l.naoRegistado) return false;
    if (filtro !== "todos" && filtro !== "nao_registados" && l.classificacao.estado !== filtro)
      return false;
    if (!q) return true;
    return (
      l.cliente.nome.toLowerCase().includes(q) ||
      (l.cliente.telefone ?? "").includes(q.replace(/\s/g, ""))
    );
  });
}
