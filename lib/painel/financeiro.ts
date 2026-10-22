import "server-only";
import { diasDoMes, hojeIso, primeiroDoMes } from "@/lib/formatacao/datas";
import {
  comissoesPagas,
  faturacaoServicos,
  receitaBarbearia,
  resumoMes,
  type ResumoMes,
} from "@/lib/regras/financeiro";
import { receitaLojaSemIva } from "@/lib/regras/loja";
import {
  diasDeFuncionamento,
  progressoObjetivo,
  type ProgressoObjetivo,
} from "@/lib/regras/objetivos";
import { obterConfiguracao } from "@/lib/repositorios/painel/barbearia";
import { listarCustos, listarDespesas, type Conta } from "@/lib/repositorios/painel/financeiro";
import { listarObjetivos } from "@/lib/repositorios/painel/objetivos";
import { linhasLevantadas, mensalidadesRecebidas } from "@/lib/repositorios/painel/receitas";
import type { ClienteBD } from "@/lib/supabase/tipos";
import { acertosDoMes, type LinhaAcertoProfissional } from "./acertos";
import { calendarioDoMes, intervaloDoMes } from "./calendario";

// O Financeiro de um mês (E.2): objetivos, contas, resumo e acertos, todos a partir das mesmas
// funções do Início (faturação de serviços) e dos acertos (receita da barbearia).

export type ObjetivoProfissional = {
  profissionalId: string;
  nome: string;
  objetivoCent: number;
  faturadoCent: number;
  percentagem: number;
};

export type FinanceiroMes = {
  mes: string;
  progresso: ProgressoObjetivo;
  objetivosProfissionais: ObjetivoProfissional[];
  custos: Conta[];
  despesas: Conta[];
  resumo: ResumoMes;
  acertos: LinhaAcertoProfissional[];
};

export async function financeiroDoMes(
  bd: ClienteBD,
  inquilinoId: string,
  anoMes: string,
): Promise<FinanceiroMes> {
  const dias = diasDoMes(anoMes);
  const intervalo = intervaloDoMes(anoMes);
  const b = await obterConfiguracao(bd, inquilinoId);
  const [calendario, objetivos, custos, despesas, { linhas, visitas }, clube, loja] =
    await Promise.all([
      calendarioDoMes(bd, b, anoMes),
      listarObjetivos(bd, inquilinoId, primeiroDoMes(anoMes)),
      listarCustos(bd, inquilinoId, { de: dias[0], ate: dias[dias.length - 1] }),
      listarDespesas(bd, inquilinoId, { de: dias[0], ate: dias[dias.length - 1] }),
      acertosDoMes(bd, inquilinoId, anoMes),
      mensalidadesRecebidas(bd, inquilinoId, intervalo),
      linhasLevantadas(bd, inquilinoId, intervalo),
    ]);
  const faturacaoCent = faturacaoServicos(visitas);
  const objetivo = objetivos.find((o) => o.profissionalId === null)?.valorCent ?? 0;
  const hoje = hojeIso();
  const progresso = progressoObjetivo(
    objetivo,
    faturacaoCent,
    diasDeFuncionamento(anoMes, calendario),
    hoje,
  );
  const receitaCent = receitaBarbearia({
    visitasModeloA: visitas.filter((v) => v.modelo === "A"),
    acertos: linhas,
    mensalidadesClubeCent: clube,
    lojaSemIvaCent: receitaLojaSemIva(loja),
  });
  const soma = (cs: Conta[]) => cs.reduce((a, c) => a + c.valorCent, 0);
  return {
    mes: anoMes,
    progresso,
    objetivosProfissionais: linhas
      .filter((l) => l.ativo)
      .map((l) => {
        const o = objetivos.find((x) => x.profissionalId === l.profissionalId)?.valorCent ?? 0;
        return {
          profissionalId: l.profissionalId,
          nome: l.nome,
          objetivoCent: o,
          faturadoCent: l.receitaCent,
          percentagem: o > 0 ? Math.round((l.receitaCent / o) * 100) : 0,
        };
      }),
    custos,
    despesas,
    resumo: resumoMes({
      faturacaoCent,
      receitaCent,
      comissoesCent: comissoesPagas(linhas),
      custosCent: soma(custos),
      despesasCent: soma(despesas),
    }),
    acertos: linhas,
  };
}
