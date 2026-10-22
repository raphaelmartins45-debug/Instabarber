import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { DadosResumo } from "@/lib/pdf/resumo-contratacao";
import {
  calcularPrecoCent,
  INCLUIDOS,
  MESES_NO_ANUAL,
  profissionaisExtra,
  type Periodicidade,
  type Plano,
  type RegimeIva,
} from "@/lib/regras/mensalidade";

// Contas do passo de contratação (D.6, D.9) e dados do resumo em PDF (D.11), a partir da
// fórmula única. Funções puras: correm no browser e nos testes.

const t = textos.adesao;

export type Catalogo = { chave: string; nome: string; grupo: string }[];
export type Pacotes = Record<Plano, string[]>;

export type Escolha = { plano: Plano; periodicidade: Periodicidade; profissionais: number };

/** Linhas da decomposição: base e extras, na periodicidade escolhida, sem IVA (preço de tabela). */
export function decomposicao({ plano, periodicidade, profissionais }: Escolha) {
  const multiplicador = periodicidade === "anual" ? MESES_NO_ANUAL : 1;
  const base = calcularPrecoCent(plano, INCLUIDOS[plano], "mensal").semIva * multiplicador;
  const { extras, valorCent } = profissionaisExtra(plano, profissionais);
  const linhas = [{ rotulo: `${t.pdf.base} ${t.contratacao.planos[plano]}`, valorCent: base }];
  if (extras > 0)
    linhas.push({ rotulo: t.pdf.extras(extras), valorCent: valorCent * multiplicador });
  return linhas;
}

/** O que fica incluído no plano (D.9): primeiro o do plano, depois o que é só do Pro. */
export function listaIncluida(catalogo: Catalogo, pacotes: Pacotes, plano: Plano) {
  const doPlano = new Set(pacotes[plano]);
  const pro = new Set(pacotes.pro);
  return catalogo
    .filter((f) => doPlano.has(f.chave) || pro.has(f.chave))
    .map((f) => ({ ...f, incluida: doPlano.has(f.chave) }));
}

export function dadosDoResumo(
  v: {
    nome: string;
    responsavel: string;
    nif: string;
    email_acesso: string;
    preferencia_pagamento: "mbway" | "transferencia" | "dinheiro";
  } & Escolha,
  catalogo: Catalogo,
  pacotes: Pacotes,
  regime: RegimeIva,
  data: string,
): DadosResumo {
  const preco = calcularPrecoCent(v.plano, v.profissionais, v.periodicidade, false, regime);
  return {
    contratante: v.nome,
    responsavel: v.responsavel,
    nif: v.nif,
    plano: t.contratacao.planos[v.plano],
    periodicidade: t.contratacao.periodicidades[v.periodicidade],
    profissionais: v.profissionais,
    decomposicao: decomposicao(v),
    preco,
    textoIva:
      regime === "isento"
        ? t.contratacao.isento
        : t.contratacao.ivaIncluido(formatarDinheiro(preco.comIva - preco.semIva)),
    funcionalidades: listaIncluida(catalogo, pacotes, v.plano)
      .filter((f) => f.incluida)
      .map((f) => f.nome),
    emailAcesso: v.email_acesso,
    pagamento: t.contratacao.pagamentos[v.preferencia_pagamento],
    data,
  };
}
