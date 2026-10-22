import "server-only";
import { instanteLocal, primeiroDoMes, somarDias, diasDoMes } from "@/lib/formatacao/datas";
import type { CalendarioBarbearia } from "@/lib/regras/objetivos";
import { listarAusencias } from "@/lib/repositorios/painel/agenda";
import type { ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";
import { listarFeriados } from "@/lib/repositorios/feriados";
import type { ClienteBD } from "@/lib/supabase/tipos";

// O calendário de funcionamento de um mês (F.3), montado a partir da base de dados.

/** O intervalo de instantes de um dia local: da meia-noite à meia-noite seguinte. */
export function intervaloDoDia(dia: string): { de: Date; ate: Date } {
  return { de: instanteLocal(dia, "00:00"), ate: instanteLocal(somarDias(dia, 1), "00:00") };
}

/** O intervalo de instantes de um mês «AAAA-MM». */
export function intervaloDoMes(anoMes: string): { de: Date; ate: Date } {
  const dias = diasDoMes(anoMes);
  return {
    de: instanteLocal(primeiroDoMes(anoMes), "00:00"),
    ate: instanteLocal(somarDias(dias[dias.length - 1]!, 1), "00:00"),
  };
}

export async function calendarioDoMes(
  bd: ClienteBD,
  b: ConfiguracaoBarbearia,
  anoMes: string,
): Promise<CalendarioBarbearia> {
  const dias = diasDoMes(anoMes);
  const [feriados, ausencias] = await Promise.all([
    listarFeriados(bd, b.id, dias[0]!, dias[dias.length - 1]!),
    listarAusencias(bd, b.id, intervaloDoMes(anoMes)),
  ]);
  return {
    diasDescanso: b.dias_descanso,
    fechaFeriados: b.fecha_feriados,
    horaAbertura: b.hora_abertura,
    horaFecho: b.hora_fecho,
    feriadosNacionais: feriados.filter((f) => !f.inquilino_id).map((f) => f.data),
    feriadosProprios: feriados.filter((f) => f.inquilino_id).map((f) => f.data),
    ausenciasBarbearia: ausencias.filter((a) => !a.profissionalId),
  };
}
