import { comDescontoCent } from "@/lib/regras/mensalidade";

// Condições comerciais (D-161): descontos na mensalidade e taxa de migração, desligados até a
// Performa LAB os ligar. O comercial fica dentro dos limites; a Performa LAB não. A base de
// dados confere tudo outra vez em criar_proposta().

export type CondicoesComerciais = {
  descontosAtivos: boolean;
  descontoMaxMensalidade: number;
  taxaAtiva: boolean;
  taxaBaseCent: number;
  descontoMaxTaxa: number;
};

export const CONDICOES_DESLIGADAS: CondicoesComerciais = {
  descontosAtivos: false,
  descontoMaxMensalidade: 20,
  taxaAtiva: false,
  taxaBaseCent: 0,
  descontoMaxTaxa: 50,
};

export type DescontosPedidos = { mensalidade: number; taxa: number };

export type CondicoesAplicadas =
  | { ok: true; descontoMensalidade: number; descontoTaxa: number; taxaCent: number }
  | { ok: false; erro: "desconto_acima_do_limite" };

/** Os descontos que valem na proposta: zero com o interruptor desligado; limites só ao comercial. */
export function aplicarCondicoes(
  pedido: DescontosPedidos,
  c: CondicoesComerciais,
  administrador: boolean,
): CondicoesAplicadas {
  const descontoMensalidade = c.descontosAtivos ? pedido.mensalidade : 0;
  const descontoTaxa = c.taxaAtiva ? pedido.taxa : 0;
  if (
    !administrador &&
    (descontoMensalidade > c.descontoMaxMensalidade || descontoTaxa > c.descontoMaxTaxa)
  )
    return { ok: false, erro: "desconto_acima_do_limite" };
  return {
    ok: true,
    descontoMensalidade,
    descontoTaxa,
    taxaCent: c.taxaAtiva ? comDescontoCent(c.taxaBaseCent, descontoTaxa) : 0,
  };
}
