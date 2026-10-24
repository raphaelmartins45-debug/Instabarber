import { diasDoMes } from "@/lib/formatacao/datas";
import { TAXA_IVA, type RegimeIva } from "@/lib/regras/mensalidade";

// Custos e contas a pagar da Performa LAB (O.4). Valores em cêntimos sem IVA; o anual conta
// 1/12 por mês e o único não entra no custo mensal. As datas são AAAA-MM-DD (Europe/Lisbon).

export const CATEGORIAS = [
  "infraestrutura",
  "dominios",
  "ferramentas",
  "contabilidade",
  "marketing",
  "outros",
] as const;
export const TIPOS = ["fixo", "variavel"] as const;
export const PERIODICIDADES = ["mensal", "anual", "unico"] as const;

export type Custo = {
  id?: string;
  descricao: string;
  categoria: (typeof CATEGORIAS)[number];
  tipo: (typeof TIPOS)[number];
  valorSemIvaCent: number;
  periodicidade: (typeof PERIODICIDADES)[number];
  dataInicio: string;
  dataFim: string | null;
  ativo: boolean;
};

/** Equivalente mensal de um custo (o anual a dividir por 12; o único não é recorrente). */
export function equivalenteMensalCent(c: Pick<Custo, "valorSemIvaCent" | "periodicidade">) {
  if (c.periodicidade === "anual") return Math.round(c.valorSemIvaCent / 12);
  return c.periodicidade === "mensal" ? c.valorSemIvaCent : 0;
}

/** Ativo em algum dia do mês AAAA-MM: começou até ao fim do mês e não acabou antes do início. */
export function ativoNoMes(c: Pick<Custo, "ativo" | "dataInicio" | "dataFim">, mes: string) {
  return c.ativo && c.dataInicio.slice(0, 7) <= mes && (!c.dataFim || c.dataFim.slice(0, 7) >= mes);
}

/** Custos do mês (equivalente mensal), separados em fixos e variáveis. */
export function custosDoMes(custos: Custo[], mes: string) {
  return custos
    .filter((c) => ativoNoMes(c, mes))
    .reduce(
      (s, c) => {
        const v = equivalenteMensalCent(c);
        return c.tipo === "fixo"
          ? { ...s, fixos: s.fixos + v, total: s.total + v }
          : { ...s, variaveis: s.variaveis + v, total: s.total + v };
      },
      { fixos: 0, variaveis: 0, total: 0 },
    );
}

/** Valor com IVA de um custo registado sem IVA (no regime isento o IVA pago não se deduz). */
export const comIvaCent = (semIvaCent: number) => Math.round(semIvaCent * (1 + TAXA_IVA));

/** O que conta como custo de uma conta: sem IVA no regime normal, com IVA no isento (O.3). */
export const custoDaConta = (c: { semIvaCent: number; comIvaCent: number }, regime: RegimeIva) =>
  regime === "isento" ? c.comIvaCent : c.semIvaCent;

export type ContaNova = {
  custoId: string;
  fornecedor: string;
  descricao: string;
  valorSemIvaCent: number;
  valorComIvaCent: number;
  vencimento: string;
};

/** O dia do vencimento no mês: o do início do custo, ou o último dia se o mês for mais curto. */
const vencimentoNoMes = (inicio: string, mes: string) =>
  `${mes}-${String(Math.min(Number(inicio.slice(8, 10)), diasDoMes(mes).length)).padStart(2, "0")}`;

/**
 * «Gerar as contas do próximo mês» (O.4): uma conta por custo mensal ativo e uma por custo
 * anual no mês em que faz anos; o único não se repete. As que já existem para esse custo e
 * mês não se duplicam.
 */
export function contasParaGerar(
  custos: Custo[],
  mes: string,
  jaExistem: { custoId: string | null; vencimento: string }[],
): ContaNova[] {
  const existe = new Set(
    jaExistem.filter((c) => c.custoId).map((c) => `${c.custoId}|${c.vencimento.slice(0, 7)}`),
  );
  return custos
    .filter(
      (c) =>
        c.id &&
        c.valorSemIvaCent > 0 &&
        ativoNoMes(c, mes) &&
        (c.periodicidade === "mensal" ||
          (c.periodicidade === "anual" && c.dataInicio.slice(5, 7) === mes.slice(5, 7))) &&
        !existe.has(`${c.id}|${mes}`),
    )
    .map((c) => ({
      custoId: c.id!,
      fornecedor: c.descricao,
      descricao: c.descricao,
      valorSemIvaCent: c.valorSemIvaCent,
      valorComIvaCent: comIvaCent(c.valorSemIvaCent),
      vencimento: vencimentoNoMes(c.dataInicio, mes),
    }));
}

/** Custos de partida (L.6), sugeridos ao operador, que os confirma e corrige. */
export const CUSTOS_DE_PARTIDA: Omit<Custo, "dataInicio" | "dataFim" | "ativo">[] = [
  {
    descricao: "Claude Code (Pro)",
    categoria: "ferramentas",
    tipo: "fixo",
    valorSemIvaCent: 1700,
    periodicidade: "mensal",
  },
  {
    descricao: "Zoho Mail (Mail Lite)",
    categoria: "ferramentas",
    tipo: "fixo",
    valorSemIvaCent: 100,
    periodicidade: "mensal",
  },
  {
    descricao: "Vercel (Hobby)",
    categoria: "infraestrutura",
    tipo: "fixo",
    valorSemIvaCent: 0,
    periodicidade: "mensal",
  },
  {
    descricao: "Supabase (Free)",
    categoria: "infraestrutura",
    tipo: "fixo",
    valorSemIvaCent: 0,
    periodicidade: "mensal",
  },
  {
    descricao: "Resend (gratuito)",
    categoria: "infraestrutura",
    tipo: "fixo",
    valorSemIvaCent: 0,
    periodicidade: "mensal",
  },
  {
    descricao: "Domínio instabarber.pt",
    categoria: "dominios",
    tipo: "fixo",
    valorSemIvaCent: 1000,
    periodicidade: "anual",
  },
  {
    descricao: "Domínio instabarber.es",
    categoria: "dominios",
    tipo: "fixo",
    valorSemIvaCent: 1000,
    periodicidade: "anual",
  },
  {
    descricao: "Domínio instabarber.eu",
    categoria: "dominios",
    tipo: "fixo",
    valorSemIvaCent: 1000,
    periodicidade: "anual",
  },
  {
    descricao: "Domínio instabarber.online",
    categoria: "dominios",
    tipo: "fixo",
    valorSemIvaCent: 1000,
    periodicidade: "anual",
  },
];

/** Alertas do painel geral (O.4): contas pendentes que vencem até `limite` (hoje + 7) e atrasadas. */
export function alertasContas(
  contas: { vencimento: string; estado: "pendente" | "atrasada" | "paga" }[],
  limite: string,
) {
  return {
    aVencer: contas.filter((c) => c.estado === "pendente" && c.vencimento <= limite).length,
    atrasadas: contas.filter((c) => c.estado === "atrasada").length,
  };
}
