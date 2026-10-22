import { dataCurta, hojeIso, horaCurta, minutosAte } from "@/lib/formatacao/datas";
import { textos } from "@/lib/i18n/pt-PT";
import type { EstadoCliente } from "./classificacao";

// Texto das mensagens por wa.me (F.4.10). O sistema prepara; quem envia confirma no WhatsApp.

const t = textos.mensagensWhatsApp;

/** O primeiro nome, para a saudação. */
export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome;

/** Lembrete de marcação (D-54): no próprio dia, quantos minutos faltam (Europe/Lisbon). */
export function mensagemLembrete(
  d: { cliente: string; servico: string; inicio: string; barbeiro: string; barbearia: string },
  agora: Date = new Date(),
): string {
  const mesmoDia = hojeIso(new Date(d.inicio)) === hojeIso(agora) && new Date(d.inicio) > agora;
  return t.lembrete({
    nome: primeiroNome(d.cliente),
    servico: d.servico,
    data: dataCurta(d.inicio),
    hora: horaCurta(d.inicio),
    barbeiro: d.barbeiro,
    barbearia: d.barbearia,
    minutos: mesmoDia ? minutosAte(d.inicio, agora) : null,
  });
}

export type TipoMensagemCliente = "posvenda" | "recuperacao";

/** O tipo de mensagem que a classificação sugere (F.1). */
export function tipoSugerido(estado: EstadoCliente): TipoMensagemCliente | null {
  if (estado === "sem_historico") return null;
  return estado === "ativo" ? "posvenda" : "recuperacao";
}

/**
 * Mensagem individual para um cliente: pós-venda (ativo), convite a regressar (em risco) ou
 * reativação (perdido), com o nome, os dias sem vir, o último serviço e a data, e a página.
 */
export function mensagemCliente(d: {
  estado: EstadoCliente;
  cliente: string;
  diasSemVir: number;
  ultimoServico: string;
  ultimaVisita: string;
  pagina: string;
  assinatura: string;
}): string {
  const base = {
    nome: primeiroNome(d.cliente),
    servico: d.ultimoServico,
    data: dataCurta(d.ultimaVisita),
    pagina: d.pagina,
    assinatura: d.assinatura,
  };
  if (d.estado === "ativo") return t.posvenda(base);
  if (d.estado === "em_risco") return t.convite({ ...base, dias: d.diasSemVir });
  return t.reativacao({ ...base, dias: d.diasSemVir });
}

/** Felicitação de aniversário: nunca menciona o desconto (F.3.1). */
export function mensagemAniversario(cliente: string, assinatura: string): string {
  return t.aniversario({ nome: primeiroNome(cliente), assinatura });
}

/** Aviso de vaga a quem está na fila de espera (F.4.1): serviço, horário que abriu e o prazo. */
export function mensagemFilaVaga(d: {
  cliente: string;
  servico: string;
  inicio: string;
  barbearia: string;
}): string {
  return t.filaVaga({
    nome: primeiroNome(d.cliente),
    servico: d.servico,
    data: dataCurta(d.inicio),
    hora: horaCurta(d.inicio),
    barbearia: d.barbearia,
  });
}

/** Pedido de avaliação no Google depois do serviço (F.4.13). */
export function mensagemAvaliacao(cliente: string, ligacao: string, assinatura: string): string {
  return t.avaliacao({ nome: primeiroNome(cliente), ligacao, assinatura });
}

/** Dias entre dois pedidos de avaliação ao mesmo cliente (F.4.13). */
export const DIAS_ENTRE_AVALIACOES = 90;

export function podePedirAvaliacao(ultimoPedido: string | null, agora: Date = new Date()): boolean {
  if (!ultimoPedido) return true;
  return agora.getTime() - new Date(ultimoPedido).getTime() >= DIAS_ENTRE_AVALIACOES * 86_400_000;
}
