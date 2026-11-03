import { comDescontoCent } from "@/lib/regras/mensalidade";

// Condições comerciais (D-161, D-189): descontos na mensalidade e a implementação (Essencial ou
// com Formação), desligados até a Performa LAB os ligar. O comercial fica dentro dos limites; a
// Performa LAB não. A base de dados confere tudo outra vez em criar_proposta().

export const IMPLEMENTACOES = ["nenhuma", "essencial", "formacao"] as const;
export type Implementacao = (typeof IMPLEMENTACOES)[number];

export type CondicoesComerciais = {
  descontosAtivos: boolean;
  descontoMaxMensalidade: number;
  taxaAtiva: boolean;
  /** Preço de cada pacote de implementação, sem IVA, em cêntimos. */
  precosCent: Record<Exclude<Implementacao, "nenhuma">, number>;
  descontoMaxTaxa: number;
};

export const CONDICOES_DESLIGADAS: CondicoesComerciais = {
  descontosAtivos: false,
  descontoMaxMensalidade: 20,
  taxaAtiva: false,
  precosCent: { essencial: 5000, formacao: 10000 },
  descontoMaxTaxa: 50,
};

export type DescontosPedidos = { mensalidade: number; taxa: number; implementacao: Implementacao };

export type CondicoesAplicadas =
  | {
      ok: true;
      descontoMensalidade: number;
      implementacao: Implementacao;
      descontoTaxa: number;
      taxaCent: number;
    }
  | { ok: false; erro: "desconto_acima_do_limite" };

/** Preço da implementação escolhida, com o desconto (zero sem implementação). */
export const precoImplementacaoCent = (
  c: CondicoesComerciais,
  implementacao: Implementacao,
  desconto: number,
) => (implementacao === "nenhuma" ? 0 : comDescontoCent(c.precosCent[implementacao], desconto));

/** O que vale na proposta: zero com o interruptor desligado; limites só ao comercial. */
export function aplicarCondicoes(
  pedido: DescontosPedidos,
  c: CondicoesComerciais,
  administrador: boolean,
): CondicoesAplicadas {
  const descontoMensalidade = c.descontosAtivos ? pedido.mensalidade : 0;
  const implementacao = c.taxaAtiva ? pedido.implementacao : "nenhuma";
  const descontoTaxa = implementacao === "nenhuma" ? 0 : pedido.taxa;
  if (
    !administrador &&
    (descontoMensalidade > c.descontoMaxMensalidade || descontoTaxa > c.descontoMaxTaxa)
  )
    return { ok: false, erro: "desconto_acima_do_limite" };
  return {
    ok: true,
    descontoMensalidade,
    implementacao,
    descontoTaxa,
    taxaCent: precoImplementacaoCent(c, implementacao, descontoTaxa),
  };
}
