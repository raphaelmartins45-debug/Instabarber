import { diasEntreDatas } from "@/lib/formatacao/datas";

// Saúde de cada barbearia (sugestão A) e arranque das novas (sugestão B), D-159. Regras puras sobre
// contagens que a base de dados já tem; nenhuma prevê o futuro, só sinaliza para o operador agir.

export type DadosSaude = {
  estado: string;
  estadoPagamento: string;
  aprovadaEm: string | null;
  temLogotipo: boolean;
  servicosAtivos: number;
  profissionaisAtivos: number;
  profissionaisComAcesso: number;
  clientes: number;
  marcacoesTotal: number;
  marcacoesOnline: number;
  concluidas: number;
  marcacoes30: number;
  marcacoesAnteriores30: number;
  ultimaMarcacao: string | null;
  /** Contratados no plano; quando falta (carteira do comercial), o sinal não se avalia. */
  profissionaisContratados?: number;
};

export const PASSOS_ARRANQUE = [
  "logotipo",
  "servicos",
  "equipa",
  "acessos",
  "clientes",
  "primeiraMarcacao",
  "marcacaoOnline",
  "primeiroConcluido",
] as const;
export type PassoArranque = (typeof PASSOS_ARRANQUE)[number];

/** Os passos do arranque já cumpridos e a percentagem (0 a 100, inteira). */
export function arranque(d: DadosSaude) {
  const feito: Record<PassoArranque, boolean> = {
    logotipo: d.temLogotipo,
    servicos: d.servicosAtivos > 0,
    equipa: d.profissionaisAtivos > 0,
    acessos: d.profissionaisComAcesso > 0,
    clientes: d.clientes > 0,
    primeiraMarcacao: d.marcacoesTotal > 0,
    marcacaoOnline: d.marcacoesOnline > 0,
    primeiroConcluido: d.concluidas > 0,
  };
  const n = PASSOS_ARRANQUE.filter((p) => feito[p]).length;
  return { feito, percentagem: Math.round((n / PASSOS_ARRANQUE.length) * 100) };
}

export type Motivo =
  | "atraso"
  | "suspensa"
  | "semMarcacoes"
  | "quedaMarcacoes"
  | "arranqueLento"
  | "profissionaisPorUsar";
export type Nivel = "risco" | "atencao" | "bom";

const RISCO: Motivo[] = ["atraso", "suspensa", "semMarcacoes"];

/**
 * Nível de risco de cancelar: «risco» com pagamento em atraso, suspensão ou 14 dias sem marcações
 * (passados os primeiros 14 dias); «atenção» com marcações a cair para metade (com base de 10 ou
 * mais), o arranque abaixo de 50 % depois de 30 dias ou mais profissionais contratados do que
 * ativos (paga por algo que não usa, M.2).
 */
export function saude(d: DadosSaude, hoje: string): { nivel: Nivel; motivos: Motivo[] } {
  const motivos: Motivo[] = [];
  const idade = d.aprovadaEm ? diasEntreDatas(d.aprovadaEm, hoje) : 0;
  if (d.estadoPagamento === "em_atraso") motivos.push("atraso");
  if (d.estado === "suspenso") motivos.push("suspensa");
  const semMarcar = d.ultimaMarcacao ? diasEntreDatas(d.ultimaMarcacao, hoje) : idade;
  if (idade > 14 && semMarcar > 14) motivos.push("semMarcacoes");
  if (d.marcacoesAnteriores30 >= 10 && d.marcacoes30 <= d.marcacoesAnteriores30 / 2)
    motivos.push("quedaMarcacoes");
  if (idade > 30 && arranque(d).percentagem < 50) motivos.push("arranqueLento");
  if ((d.profissionaisContratados ?? 0) > d.profissionaisAtivos)
    motivos.push("profissionaisPorUsar");
  const nivel: Nivel = motivos.some((m) => RISCO.includes(m))
    ? "risco"
    : motivos.length
      ? "atencao"
      : "bom";
  return { nivel, motivos };
}
