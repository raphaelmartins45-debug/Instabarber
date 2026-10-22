import "server-only";
import { diaSemanaDe, instanteLocal } from "@/lib/formatacao/datas";
import {
  minutosDisponiveis,
  minutosMarcados,
  ocupacaoPercent,
  type Intervalo,
} from "@/lib/regras/ocupacao";
import {
  listarAusencias,
  listarMarcacoes,
  vagasDoDia,
  type Ausencia,
  type MarcacaoDia,
} from "@/lib/repositorios/painel/agenda";
import { obterConfiguracao, type ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";
import { listarHorarios, type LinhaHorario } from "@/lib/repositorios/painel/horarios";
import { listarServicos } from "@/lib/repositorios/painel/servicos";
import { listarFeriados } from "@/lib/repositorios/feriados";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { intervaloDoDia } from "./calendario";

// A agenda de um dia (E.2 e E.3): marcações por profissional, ausências a cinzento, vagas livres
// e os indicadores do dia (marcações, faturação, ocupação).

export type ColunaAgenda = {
  profissionalId: string;
  nome: string;
  marcacoes: MarcacaoDia[];
  ausencias: Ausencia[];
  /** Inícios livres, com o serviço mais curto (só para assinalar; a marcação revalida). */
  livres: string[];
};

export type AgendaDia = {
  dia: string;
  colunas: ColunaAgenda[];
  marcacoes: number;
  faturacaoCent: number;
  ocupacao: number | null;
  fechado: boolean;
};

/** Janelas de trabalho de um profissional num dia: horário próprio ou o da barbearia. */
export function janelasDoDia(
  b: ConfiguracaoBarbearia,
  horarios: readonly LinhaHorario[],
  profissionalId: string,
  dia: string,
  feriado: boolean,
): Intervalo[] {
  const dow = diaSemanaDe(dia);
  const proprio = horarios.filter((h) => h.profissionalId === profissionalId);
  const faixa = (de: string, ate: string) => ({
    inicio: instanteLocal(dia, de),
    fim: instanteLocal(dia, ate),
  });
  if (feriado) return [];
  if (proprio.length)
    return proprio.filter((h) => h.diaSemana === dow).map((h) => faixa(h.inicio, h.fim));
  if (b.dias_descanso.includes(dow)) return [];
  if (b.intervalo_almoco_inicio && b.intervalo_almoco_fim)
    return [
      faixa(b.hora_abertura, b.intervalo_almoco_inicio),
      faixa(b.intervalo_almoco_fim, b.hora_fecho),
    ];
  return [faixa(b.hora_abertura, b.hora_fecho)];
}

export async function agendaDoDia(
  bd: ClienteBD,
  inquilinoId: string,
  dia: string,
  profissionalId: string | null = null,
): Promise<AgendaDia> {
  const intervalo = intervaloDoDia(dia);
  const [b, equipa, marcacoes, ausencias, horarios, servicos, feriados] = await Promise.all([
    obterConfiguracao(bd, inquilinoId),
    listarEquipa(bd, inquilinoId),
    listarMarcacoes(bd, inquilinoId, intervalo, { profissionalId }),
    listarAusencias(bd, inquilinoId, intervalo),
    listarHorarios(bd, inquilinoId),
    listarServicos(bd, inquilinoId),
    listarFeriados(bd, inquilinoId, dia, dia),
  ]);
  const feriado = feriados.some((f) => (f.inquilino_id ? true : b.fecha_feriados));
  const maisCurto = [...servicos].sort((a, c) => a.duracaoMin - c.duracaoMin)[0];
  const vagas = maisCurto
    ? await vagasDoDia(bd, inquilinoId, maisCurto.id, dia, profissionalId)
    : [];

  const ativos = equipa.filter((p) => p.ativo && (!profissionalId || p.id === profissionalId));
  let disponivel = 0;
  let marcado = 0;
  const colunas = ativos.map((p): ColunaAgenda => {
    const minhas = marcacoes.filter((m) => m.profissionalId === p.id);
    const aus = ausencias.filter((a) => !a.profissionalId || a.profissionalId === p.id);
    const janelas = janelasDoDia(b, horarios, p.id, dia, feriado);
    const bloqueios = aus.map((a) => ({ inicio: new Date(a.inicio), fim: new Date(a.fim) }));
    disponivel += minutosDisponiveis(janelas, bloqueios);
    marcado += minutosMarcados(
      janelas,
      minhas
        .filter((m) => m.estado !== "falta")
        .map((m) => ({ inicio: new Date(m.inicio), fim: new Date(m.fim) })),
    );
    return {
      profissionalId: p.id,
      nome: p.nome_apresentado,
      marcacoes: minhas,
      ausencias: aus,
      livres: vagas.filter((v) => v.profissionalId === p.id).map((v) => v.inicio),
    };
  });
  return {
    dia,
    colunas,
    marcacoes: marcacoes.filter((m) => m.estado !== "falta").length,
    faturacaoCent: marcacoes
      .filter((m) => m.estado === "concluida")
      .reduce((a, m) => a + m.valorCobradoCent, 0),
    ocupacao: ocupacaoPercent(marcado, disponivel),
    fechado: !b.aberto,
  };
}
