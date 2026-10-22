// Comissões e acertos (F.4.11). O acerto do mês monta-se a partir das visitas concluídas,
// com os valores gravados por concluir_marcacao() (percentagem e comissão não mudam depois).

export type ModeloCaixa = "A" | "B" | "C";

export type VisitaAcerto = {
  valorCobradoCent: number;
  comissaoCent: number;
  /** O serviço saiu de um crédito do clube (marcacoes.credito_id preenchido). */
  clube: boolean;
};

export type Acerto = {
  modelo: ModeloCaixa;
  servicos: number;
  /** Σ valor cobrado: a atividade do barbeiro no mês. */
  receitaCent: number;
  aPagarCent: number;
  aReceberCent: number;
  /** a pagar − a receber: positivo, a barbearia deve; negativo, o barbeiro deve. */
  saldoCent: number;
  sentido: "a_pagar" | "a_receber";
};

const soma = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

export function montarAcerto(
  modelo: ModeloCaixa,
  visitas: readonly VisitaAcerto[],
  rendaCent = 0,
): Acerto {
  const clube = visitas.filter((v) => v.clube);
  const restantes = visitas.filter((v) => !v.clube);
  let aPagarCent: number;
  let aReceberCent: number;
  if (modelo === "A") {
    aPagarCent = soma(visitas.map((v) => v.comissaoCent));
    aReceberCent = 0;
  } else if (modelo === "B") {
    aPagarCent = soma(clube.map((v) => v.comissaoCent));
    aReceberCent = soma(restantes.map((v) => v.valorCobradoCent - v.comissaoCent));
  } else {
    aPagarCent = soma(clube.map((v) => v.comissaoCent));
    aReceberCent = rendaCent;
  }
  const saldoCent = aPagarCent - aReceberCent;
  return {
    modelo,
    servicos: visitas.length,
    receitaCent: soma(visitas.map((v) => v.valorCobradoCent)),
    aPagarCent,
    aReceberCent,
    saldoCent,
    sentido: saldoCent > 0 ? "a_pagar" : "a_receber",
  };
}

export type Liquidacao = { sentido: "a_pagar" | "a_receber"; valorCent: number };

/** Liquidado com sinal: positivo = a barbearia pagou ao barbeiro. As correções têm sinal contrário. */
export function liquidadoComSinal(liquidacoes: readonly Liquidacao[]): number {
  return soma(liquidacoes.map((l) => (l.sentido === "a_pagar" ? l.valorCent : -l.valorCent)));
}

export type LinhaAcerto = Acerto & {
  /** Valor absoluto do acerto e do que já se liquidou, como na tabela da F.4.11. */
  acertoCent: number;
  liquidadoCent: number;
  porLiquidarCent: number;
  estado: "liquidado" | "a_pagar" | "a_receber";
};

/** A linha da tabela «Comissões e acertos»: acerto, liquidado e saldo por liquidar. */
export function linhaAcerto(acerto: Acerto, liquidacoes: readonly Liquidacao[]): LinhaAcerto {
  const liquidado = liquidadoComSinal(liquidacoes);
  const resto = acerto.saldoCent - liquidado;
  return {
    ...acerto,
    acertoCent: Math.abs(acerto.saldoCent),
    liquidadoCent: Math.abs(liquidado),
    porLiquidarCent: Math.abs(resto),
    estado: resto === 0 ? "liquidado" : resto > 0 ? "a_pagar" : "a_receber",
  };
}
