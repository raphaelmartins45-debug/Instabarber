import type { Recomendacao } from "@/lib/regras/recomendacoes";
import type { LinhaServico, Retencao } from "@/lib/regras/relatorio";
import type { BlocoFinanceiro } from "./relatorio-financeiro";

// A forma do relatório mensal (E.5): os nove blocos, iguais no ecrã e no PDF.

export type RelatorioMes = {
  mes: string;
  profissionalId: string | null;
  resumo: {
    faturacaoCent: number;
    variacao: number | null;
    atendidos: number;
    perdidos: number;
    recuperados: number;
  };
  evolucao: { mes: string; faturacaoCent: number }[];
  desempenho: {
    profissionalId: string;
    nome: string;
    faturacaoCent: number;
    servicos: number;
    ticketCent: number;
    objetivoPercent: number | null;
    comissaoCent: number;
  }[];
  servicos: (LinhaServico & { nome: string })[];
  retencao: Retencao & { ligacoesAbertas: number; subscricaoCent: number };
  fidelizacao: {
    selosAtribuidos: number;
    cartoesCompletos: number;
    premiosResgatados: number;
    convites: number;
  };
  financeiro: BlocoFinanceiro | null;
  operacao: {
    taxaFaltas: number | null;
    ocupacao: number | null;
    melhorDia: number | null;
    piorDia: number | null;
    antecedencia: number | null;
  };
  recomendacoes: Recomendacao[];
};
