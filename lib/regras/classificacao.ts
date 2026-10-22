import { diasDesde, diasEntreDatas, hojeIso } from "@/lib/formatacao/datas";

// Classificação de clientes (F.1, D-22). No painel do barbeiro, entram só as visitas com ele;
// no do gestor, as da barbearia inteira. Quem chama decide que visitas passa.

export const FREQUENCIA_OMISSAO_DIAS = 30;
export const INTERVALO_MAXIMO_DIAS = 180;
export const VISITAS_PARA_MEDIA = 3;
/** Probabilidade estimada de regresso após contacto (F.1 e F.5). */
export const PROBABILIDADE_REGRESSO = 0.4;

export type EstadoCliente = "ativo" | "em_risco" | "perdido" | "sem_historico";

export const ESTADOS_CLIENTE: readonly EstadoCliente[] = [
  "ativo",
  "em_risco",
  "perdido",
  "sem_historico",
];

export type Classificacao = {
  estado: EstadoCliente;
  /** Dias desde a última visita; nulo sem histórico. */
  diasSemVir: number | null;
  frequencia: number;
  ultimaVisita: string | null;
};

/**
 * Média dos intervalos entre visitas consecutivas, ignorando os superiores a 180 dias.
 * Com menos de três visitas (ou sem intervalos válidos), 30 dias.
 */
export function frequenciaHabitual(visitas: readonly (string | Date)[]): number {
  if (visitas.length < VISITAS_PARA_MEDIA) return FREQUENCIA_OMISSAO_DIAS;
  const dias = [...new Set(visitas.map((v) => hojeIso(new Date(v))))].sort();
  const intervalos = dias
    .slice(1)
    .map((d, i) => diasEntreDatas(dias[i]!, d))
    .filter((n) => n > 0 && n <= INTERVALO_MAXIMO_DIAS);
  if (intervalos.length === 0) return FREQUENCIA_OMISSAO_DIAS;
  return intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
}

export function classificar(
  visitas: readonly (string | Date)[],
  agora: Date = new Date(),
): Classificacao {
  const frequencia = frequenciaHabitual(visitas);
  if (visitas.length === 0)
    return { estado: "sem_historico", diasSemVir: null, frequencia, ultimaVisita: null };
  const ultima = visitas.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
  const diasSemVir = diasDesde(ultima, agora);
  const estado: EstadoCliente =
    diasSemVir < 1.5 * frequencia ? "ativo" : diasSemVir <= 2 * frequencia ? "em_risco" : "perdido";
  return { estado, diasSemVir, frequencia, ultimaVisita: new Date(ultima).toISOString() };
}

/** Faturação a recuperar (estimativa): Σ ticket médio dos perdidos × 0,4, em cêntimos. */
export function faturacaoARecuperar(
  clientes: readonly { estado: EstadoCliente; ticketMedioCent: number }[],
): number {
  const soma = clientes
    .filter((c) => c.estado === "perdido")
    .reduce((a, c) => a + c.ticketMedioCent, 0);
  return Math.round(soma * PROBABILIDADE_REGRESSO);
}

/** Ticket médio em cêntimos (0 sem visitas). */
export function ticketMedio(valoresCent: readonly number[]): number {
  if (valoresCent.length === 0) return 0;
  return Math.round(valoresCent.reduce((a, b) => a + b, 0) / valoresCent.length);
}
