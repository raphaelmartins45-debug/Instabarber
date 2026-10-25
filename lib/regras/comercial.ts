import { diaSemanaDe, diasEntreDatas, somarDias } from "@/lib/formatacao/datas";

// Regras de apresentação do Comercial (N.3): o que fica realçado no funil e nos alertas do
// painel geral. Sem tarefas agendadas (D-16): calcula-se ao ler.

/** Dias úteis depois de `desde` até `ate`, inclusive (sem sábados, domingos nem feriados). */
export function diasUteisEntre(
  desde: string,
  ate: string,
  feriados: ReadonlySet<string> = new Set(),
) {
  let n = 0;
  for (let i = 1; i <= diasEntreDatas(desde, ate); i++) {
    const dia = somarDias(desde, i);
    const semana = diaSemanaDe(dia);
    if (semana !== 0 && semana !== 6 && !feriados.has(dia)) n++;
  }
  return n;
}

/** Lead «novo» há mais de dois dias úteis sem ninguém lhe pegar: alerta no painel geral. */
export const leadParado = (
  lead: { estado: string; criadoEm: string },
  hoje: string,
  feriados?: ReadonlySet<string>,
) => lead.estado === "novo" && diasUteisEntre(lead.criadoEm, hoje, feriados) > 2;

/** A próxima ação já devia ter sido feita (cartão realçado no funil). */
export const acaoVencida = (proximaAcaoEm: string | null, hoje: string) =>
  !!proximaAcaoEm && diasEntreDatas(hoje, proximaAcaoEm) < 0;

/** Proposta enviada que expira nos próximos `dias` (hoje incluído). */
export const propostaAExpirar = (validaAte: string, hoje: string, dias = 3) => {
  const falta = diasEntreDatas(hoje, validaAte);
  return falta >= 0 && falta <= dias;
};

/** Lead do site sem o passo 2 do formulário (aba «Incompletos», D-50, D-150). */
export const leadIncompleto = (lead: { origem: string; temPasso2: boolean }) =>
  lead.origem === "landing" && !lead.temPasso2;
