import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { formatarNumero } from "@/lib/formatacao/numeros";
import { textos } from "@/lib/i18n/pt-PT";
import type { Recomendacao } from "@/lib/regras/recomendacoes";

// Textos do relatório que se montam com números: os mesmos no ecrã e no PDF (um só gerador).

const t = textos.relatorio;

export const nomeDia = (d: number | null) =>
  d === null ? t.vazio : (textos.sistema.diasSemana[d] ?? t.vazio);

export const percentagem = (v: number | null) => (v === null ? t.vazio : `${formatarNumero(v)} %`);

export function textoVariacao(v: number | null): string {
  if (v === null) return t.resumo.semVariacao;
  return t.resumo.variacao(`${v > 0 ? "+" : ""}${formatarNumero(v)}`);
}

export function textoRecomendacao(r: Recomendacao): string {
  const rr = t.recomendacoes;
  switch (r.tipo) {
    case "campanha":
      return rr.campanha(r.perdidos, formatarDinheiro(r.valorCent));
    case "preco_periodo":
      return rr.preco(nomeDia(r.diaSemana), r.ocupacao, formatarDinheiro(r.adicionalCent));
    case "combinacao":
      return rr.combinacao(
        r.servicos.join(" + "),
        formatarDinheiro(r.ticketCent),
        formatarDinheiro(r.ticketAnteriorCent),
      );
    case "premios":
      return rr.premios(r.cartoes);
    case "objetivo":
      return rr.objetivo(r.percentagem, formatarDinheiro(r.porDiaCent), r.diasRestantes);
  }
}
