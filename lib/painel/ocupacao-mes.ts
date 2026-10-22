import "server-only";
import { diaSemanaDe, diasDoMes, hojeIso } from "@/lib/formatacao/datas";
import { minutosDisponiveis, minutosMarcados, ocupacaoPercent } from "@/lib/regras/ocupacao";
import { listarAusencias } from "@/lib/repositorios/painel/agenda";
import type { ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";
import { listarHorarios } from "@/lib/repositorios/painel/horarios";
import type { MarcacaoOperacao } from "@/lib/repositorios/painel/relatorio";
import { listarFeriados } from "@/lib/repositorios/feriados";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { janelasDoDia } from "./agenda";
import { intervaloDoDia, intervaloDoMes } from "./calendario";

// Ocupação de um mês (E.5, bloco 8 e recomendação 2): os mesmos minutos da agenda do dia,
// somados dia a dia e por dia da semana. No mês corrente, só os dias até hoje (os seguintes
// ainda não estão fechados).

export type MinutosDia = { disponiveis: number; marcados: number };

export async function ocupacaoDoMes(
  bd: ClienteBD,
  b: ConfiguracaoBarbearia,
  anoMes: string,
  marcacoes: readonly MarcacaoOperacao[],
  profissionalId: string | null,
): Promise<{ media: number | null; porDiaSemana: Map<number, MinutosDia>; total: MinutosDia }> {
  const hoje = hojeIso();
  const dias = diasDoMes(anoMes).filter((d) => d <= hoje);
  if (dias.length === 0)
    return { media: null, porDiaSemana: new Map(), total: { disponiveis: 0, marcados: 0 } };
  const [equipa, horarios, ausencias, feriados] = await Promise.all([
    listarEquipa(bd, b.id),
    listarHorarios(bd, b.id),
    listarAusencias(bd, b.id, intervaloDoMes(anoMes)),
    listarFeriados(bd, b.id, dias[0]!, dias[dias.length - 1]!),
  ]);
  const ativos = equipa.filter((p) => p.ativo && (!profissionalId || p.id === profissionalId));
  const porDiaSemana = new Map<number, MinutosDia>();
  const total: MinutosDia = { disponiveis: 0, marcados: 0 };
  for (const dia of dias) {
    const { de, ate } = intervaloDoDia(dia);
    const feriado = feriados.some(
      (f) => f.data === dia && (f.inquilino_id ? true : b.fecha_feriados),
    );
    for (const p of ativos) {
      const janelas = janelasDoDia(b, horarios, p.id, dia, feriado);
      const bloqueios = ausencias
        .filter(
          (a) =>
            (!a.profissionalId || a.profissionalId === p.id) &&
            new Date(a.inicio) < ate &&
            new Date(a.fim) > de,
        )
        .map((a) => ({ inicio: new Date(a.inicio), fim: new Date(a.fim) }));
      const disponiveis = minutosDisponiveis(janelas, bloqueios);
      const marcados = minutosMarcados(
        janelas,
        marcacoes
          .filter(
            (m) =>
              m.profissionalId === p.id &&
              m.estado !== "falta" &&
              new Date(m.inicio) >= de &&
              new Date(m.inicio) < ate,
          )
          .map((m) => ({ inicio: new Date(m.inicio), fim: new Date(m.fim) })),
      );
      if (disponiveis === 0) continue;
      const dow = diaSemanaDe(dia);
      const atual = porDiaSemana.get(dow) ?? { disponiveis: 0, marcados: 0 };
      porDiaSemana.set(dow, {
        disponiveis: atual.disponiveis + disponiveis,
        marcados: atual.marcados + marcados,
      });
      total.disponiveis += disponiveis;
      total.marcados += marcados;
    }
  }
  return { media: ocupacaoPercent(total.marcados, total.disponiveis), porDiaSemana, total };
}
