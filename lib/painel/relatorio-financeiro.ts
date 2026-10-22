import "server-only";
import { comissoesPagas } from "@/lib/regras/financeiro";
import { estadoStock, receitaLojaSemIva } from "@/lib/regras/loja";
import { listarProdutos } from "@/lib/repositorios/painel/loja";
import { linhasLevantadas, mensalidadesRecebidas } from "@/lib/repositorios/painel/receitas";
import { estadoClube } from "@/lib/repositorios/painel/relatorio";
import type { ClienteBD } from "@/lib/supabase/tipos";
import type { FinanceiroMes } from "./financeiro";

// Bloco 7 do relatório (E.5), só do gestor: as linhas do Financeiro do mesmo mês, divididas
// pelos modelos de caixa, e as do clube e da loja quando estão ligados.

export type BlocoFinanceiro = {
  receitaPropriaCent: number;
  rendasCent: number;
  parteCasaCent: number;
  comissoesCent: number;
  custosCent: number;
  despesasCent: number;
  receitaCent: number;
  resultadoCent: number;
  margem: number | null;
  clube: { mensalidadesCent: number; subscritores: number; creditosPorUsar: number } | null;
  loja: {
    receitaSemIvaCent: number;
    custoCent: number;
    margemCent: number;
    abaixoMinimo: number;
  } | null;
};

export async function blocoFinanceiro(
  bd: ClienteBD,
  inquilinoId: string,
  f: FinanceiroMes,
  receitaPropriaCent: number,
  intervalo: { de: Date; ate: Date },
  hoje: string,
  ativas: ReadonlySet<string>,
): Promise<BlocoFinanceiro> {
  const doModelo = (m: "B" | "C") =>
    f.acertos.filter((l) => l.modelo === m).reduce((a, l) => a + l.aReceberCent, 0);
  const [clube, mensalidades, linhas, produtos] = await Promise.all([
    ativas.has("clube_assinatura") ? estadoClube(bd, inquilinoId, hoje) : null,
    ativas.has("clube_assinatura") ? mensalidadesRecebidas(bd, inquilinoId, intervalo) : 0,
    ativas.has("loja_produtos") ? linhasLevantadas(bd, inquilinoId, intervalo) : [],
    ativas.has("loja_produtos") ? listarProdutos(bd, inquilinoId) : [],
  ]);
  const receitaLoja = receitaLojaSemIva(linhas);
  const custoLoja = linhas.reduce((a, l) => a + l.custoUnitarioCent * l.quantidade, 0);
  return {
    receitaPropriaCent,
    rendasCent: doModelo("C"),
    parteCasaCent: doModelo("B"),
    comissoesCent: comissoesPagas(f.acertos),
    custosCent: f.resumo.custosCent,
    despesasCent: f.resumo.despesasCent,
    receitaCent: f.resumo.receitaCent,
    resultadoCent: f.resumo.resultadoCent,
    margem: f.resumo.margem,
    clube: clube ? { mensalidadesCent: mensalidades, ...clube } : null,
    loja: ativas.has("loja_produtos")
      ? {
          receitaSemIvaCent: receitaLoja,
          custoCent: custoLoja,
          margemCent: receitaLoja - custoLoja,
          abaixoMinimo: produtos.filter(
            (p) => p.ativo && estadoStock(p.stock, p.stockMinimo) !== "em_stock",
          ).length,
        }
      : null,
  };
}
