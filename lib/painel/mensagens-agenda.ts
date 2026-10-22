import { mensagemAvaliacao, mensagemLembrete, podePedirAvaliacao } from "@/lib/regras/mensagens";
import { ligacaoWhatsApp } from "@/lib/regras/whatsapp";
import { clientesContactaveis } from "@/lib/repositorios/painel/clientes";
import { ultimaMensagemPorCliente } from "@/lib/repositorios/painel/mensagens";
import type { MarcacaoDia } from "@/lib/repositorios/painel/agenda";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { AgendaDia } from "./agenda";
import type { ItemLote } from "./mensagens";

// As mensagens que a agenda prepara (F.4.10, F.4.13): os lembretes em lote do dia (Pro) e o
// pedido de avaliação depois do serviço (Pro, com consentimento, um a cada 90 dias).

export type MensagemPreparada = { ligacao: string; conteudo: string };

export function lembreteDe(m: MarcacaoDia, barbearia: string): MensagemPreparada | null {
  if (!m.telefone || !m.cliente) return null;
  const conteudo = mensagemLembrete({
    cliente: m.cliente,
    servico: m.servico,
    inicio: m.inicio,
    barbeiro: m.profissional ?? "",
    barbearia,
  });
  return { ligacao: ligacaoWhatsApp(m.telefone, conteudo), conteudo };
}

export function lembretesEmLote(
  agenda: AgendaDia,
  barbearia: string,
  agora = new Date(),
): ItemLote[] {
  return agenda.colunas
    .flatMap((c) => c.marcacoes)
    .filter((m) => m.estado === "agendada" && !m.lembreteAbertoEm && new Date(m.inicio) > agora)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .flatMap((m) => {
      const l = lembreteDe(m, barbearia);
      return l ? [{ id: m.id, nome: m.cliente ?? "", tipo: "lembrete" as const, ...l }] : [];
    });
}

/** Pedidos de avaliação possíveis, por marcação concluída. */
export async function avaliacoesDoDia(
  bd: ClienteBD,
  inquilinoId: string,
  marcacoes: MarcacaoDia[],
  d: { ligacao: string | null; assinatura: string },
  agora = new Date(),
): Promise<Record<string, MensagemPreparada>> {
  if (!d.ligacao) return {};
  const concluidas = marcacoes.filter((m) => m.estado === "concluida" && m.clienteId && m.telefone);
  const ids = [...new Set(concluidas.map((m) => m.clienteId!))];
  const [contactaveis, ultimas] = await Promise.all([
    clientesContactaveis(bd, inquilinoId, ids),
    ultimaMensagemPorCliente(bd, inquilinoId, ids, "avaliacao"),
  ]);
  const saida: Record<string, MensagemPreparada> = {};
  for (const m of concluidas) {
    const id = m.clienteId!;
    if (!contactaveis.has(id) || !podePedirAvaliacao(ultimas.get(id) ?? null, agora)) continue;
    const conteudo = mensagemAvaliacao(m.cliente ?? "", d.ligacao, d.assinatura);
    saida[m.id] = { ligacao: ligacaoWhatsApp(m.telefone!, conteudo), conteudo };
  }
  return saida;
}

/** O que a agenda de um dia precisa para as mensagens, conforme as funcionalidades ligadas. */
export async function prepararMensagensAgenda(
  bd: ClienteBD,
  inquilinoId: string,
  barbearia: string,
  agenda: AgendaDia,
  ativas: ReadonlySet<string>,
  ligacaoAvaliacao: string | null,
): Promise<{ avaliacoes: Record<string, MensagemPreparada>; lote: ItemLote[] }> {
  const avaliacoes = ativas.has("pedido_avaliacao")
    ? await avaliacoesDoDia(
        bd,
        inquilinoId,
        agenda.colunas.flatMap((c) => c.marcacoes),
        { ligacao: ligacaoAvaliacao, assinatura: barbearia },
      )
    : {};
  const lote =
    ativas.has("envio_lote") && ativas.has("lembretes_marcacao")
      ? lembretesEmLote(agenda, barbearia)
      : [];
  return { avaliacoes, lote };
}
