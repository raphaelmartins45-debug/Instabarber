import "server-only";
import { hojeIso, mesAtual, primeiroDoMes } from "@/lib/formatacao/datas";
import { faturacaoServicos } from "@/lib/regras/financeiro";
import {
  diasDeFuncionamento,
  faltaHoje,
  progressoObjetivo,
  type ProgressoObjetivo,
} from "@/lib/regras/objetivos";
import { listarMarcacoes } from "@/lib/repositorios/painel/agenda";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarObjetivos } from "@/lib/repositorios/painel/objetivos";
import { listarVisitas, type Visita } from "@/lib/repositorios/painel/visitas";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { calendarioDoMes, intervaloDoDia, intervaloDoMes } from "./calendario";

// Os indicadores do dia e do mês (Início, Equipa, painel do profissional, Financeiro).
// Uma só origem: os números do Início coincidem com os do Financeiro (verificação da Fase 4).

export type IndicadoresDia = {
  hoje: string;
  faturadoHojeCent: number;
  servicosHoje: number;
  /** O agendado e ainda não atendido, hoje. */
  previsaoCent: number;
  faturadoMesCent: number;
  progresso: ProgressoObjetivo;
  faltaHojeCent: number;
  visitasMes: Visita[];
  diasFuncionamento: string[];
};

export async function indicadoresDia(
  bd: ClienteBD,
  inquilinoId: string,
  profissionalId: string | null = null,
  agora: Date = new Date(),
): Promise<IndicadoresDia> {
  const hoje = hojeIso(agora);
  const mes = mesAtual(agora);
  const dia = intervaloDoDia(hoje);
  const b = await obterConfiguracao(bd, inquilinoId);
  const [visitasMes, agendadas, objetivos, calendario] = await Promise.all([
    listarVisitas(bd, inquilinoId, { ...intervaloDoMes(mes), profissionalId }),
    listarMarcacoes(bd, inquilinoId, dia, { profissionalId, estados: ["agendada"] }),
    listarObjetivos(bd, inquilinoId, primeiroDoMes(mes)),
    calendarioDoMes(bd, b, mes),
  ]);
  const deHoje = visitasMes.filter((v) => {
    const t = new Date(v.data).getTime();
    return t >= dia.de.getTime() && t < dia.ate.getTime();
  });
  const dias = diasDeFuncionamento(mes, calendario);
  const objetivo = objetivos.find((o) => o.profissionalId === profissionalId)?.valorCent ?? 0;
  const faturadoMesCent = faturacaoServicos(visitasMes);
  const progresso = progressoObjetivo(objetivo, faturadoMesCent, dias, hoje);
  const faturadoHojeCent = faturacaoServicos(deHoje);
  return {
    hoje,
    faturadoHojeCent,
    servicosHoje: deHoje.length,
    previsaoCent: agendadas.reduce((a, m) => a + m.valorCobradoCent, 0),
    faturadoMesCent,
    progresso,
    faltaHojeCent: faltaHoje(progresso.objetivoDiarioCent, faturadoHojeCent),
    visitasMes,
    diasFuncionamento: dias,
  };
}
