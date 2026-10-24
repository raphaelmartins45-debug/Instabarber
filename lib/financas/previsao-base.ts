import { mesAnterior } from "@/lib/formatacao/datas";
import { mediaNovas, saidasPorOmissao } from "@/lib/regras/previsao";
import { type Custo, custosDoMes } from "./custos";
import type { BarbeariaFin } from "./indicadores";

// Os dados de partida da previsão (O.8), usados pelo Resumo e pelo Objetivo e previsões:
// os 12 meses seguintes, os custos de cada um e os pressupostos por omissão.

export function previsaoPorOmissao(
  barbearias: BarbeariaFin[],
  custos: Custo[],
  mes: string,
  saidasObservadas: number | null,
) {
  const meses = Array.from({ length: 12 }, (_, i) => mesAnterior(mes, -(i + 1)));
  const saidas = saidasPorOmissao(saidasObservadas);
  return {
    meses,
    custos: meses.map((m) => custosDoMes(custos, m).total),
    novas: mediaNovas(
      barbearias.flatMap((b) => (b.aprovadaEm ? [b.aprovadaEm] : [])),
      [1, 2, 3].map((i) => mesAnterior(mes, i)),
    ),
    saidas: saidas.valor,
    declarada: saidas.declarada,
  };
}
