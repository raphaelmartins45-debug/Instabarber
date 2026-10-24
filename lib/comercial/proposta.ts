import { decomposicao, listaIncluida, type Catalogo, type Pacotes } from "@/lib/adesao/resumo";
import {
  calcularPrecoCent,
  DOMINIO_PROPRIO_CENT,
  MESES_NO_ANUAL,
  type RegimeIva,
} from "@/lib/regras/mensalidade";
import { type Briefing, DORES, valorParaSiCent } from "./briefing";

// A proposta (N.5) a partir do briefing: preços pela fórmula única (D.7), a fotografia que fica
// em propostas.dados e a solução ligada às dores, só com o que o plano inclui.

/** Funcionalidades que respondem a cada dor (N.5, «A solução»). */
export const SOLUCAO_POR_DOR: Record<(typeof DORES)[number], string[]> = {
  faltas: ["lembretes_marcacao", "politica_faltas", "confirmacao_email"],
  desaparecem: ["clientes_perdidos", "envio_mensagens", "envio_lote"],
  financeiro: ["financeiro_objetivos", "contas_a_pagar", "relatorio_mensal"],
  comissoes: ["comissoes_acertos", "painel_profissional", "relatorios_por_profissional"],
  fidelizacao: ["fidelizacao_selos", "campanha_aniversario", "clube_assinatura"],
  presenca_online: ["pagina_publica", "pedido_avaliacao", "portfolio_barbeiro"],
};

const cent = (c: number) => (c / 100).toFixed(2);

/** Profissionais coerentes com o plano: o Basic tem 1; o Pro, pelo menos 2 (restrição da tabela). */
export const profissionaisDoPlano = (b: Pick<Briefing, "plano" | "profissionais">) =>
  b.plano === "basic" ? 1 : Math.max(2, b.profissionais);

export function montarProposta(
  b: Briefing,
  catalogo: Catalogo,
  pacotes: Pacotes,
  regime: RegimeIva,
) {
  const profissionais = profissionaisDoPlano(b);
  const mensal = calcularPrecoCent(b.plano, profissionais, "mensal", b.dominio_proprio, regime);
  const periodo = calcularPrecoCent(
    b.plano,
    profissionais,
    b.periodicidade,
    b.dominio_proprio,
    regime,
  );
  const doPlano = new Set(pacotes[b.plano]);
  const nomes = new Map(catalogo.map((f) => [f.chave, f.nome]));
  const multiplicador = b.periodicidade === "anual" ? MESES_NO_ANUAL : 1;
  const linhas = decomposicao({ plano: b.plano, periodicidade: b.periodicidade, profissionais });
  const desafio = b.plano === "pro" && b.desafio_90;
  return {
    plano: b.plano,
    periodicidade: b.periodicidade,
    profissionais,
    dominio_proprio: b.dominio_proprio,
    desafio_90: desafio,
    mensalidade_sem_iva: cent(mensal.semIva),
    valor_periodo_sem_iva: cent(periodo.semIva),
    valor_periodo_com_iva: cent(periodo.comIva),
    iva_taxa: periodo.ivaTaxa,
    condicoes_lancamento: b.condicoes_lancamento,
    validade_dias: b.validade_dias,
    dados: {
      briefing: b,
      decomposicao: b.dominio_proprio
        ? [...linhas, { rotulo: "dominio", valorCent: DOMINIO_PROPRIO_CENT * multiplicador }]
        : linhas,
      incluidas: listaIncluida(catalogo, pacotes, b.plano)
        .filter((f) => f.incluida)
        .map((f) => f.nome),
      solucao: b.dores.map((dor) => ({
        dor,
        funcionalidades: SOLUCAO_POR_DOR[dor]
          .filter((c) => doPlano.has(c))
          .map((c) => nomes.get(c) ?? c),
      })),
      valor_para_si_cent: valorParaSiCent(b),
      mensal_com_iva_cent: mensal.comIva,
    },
  };
}
export type PropostaMontada = ReturnType<typeof montarProposta>;
