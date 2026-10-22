import { textos } from "@/lib/i18n/pt-PT";

// O menu de cada painel monta-se a partir das funcionalidades ativas (D.3), nunca de uma
// lista fixa: o que não está ativo sai. As chaves com `mostra_upgrade` ficam à vista,
// desativadas, com a chamada de upgrade (D.2).

const m = textos.paineis.menu;

export type ItemMenu = {
  id: string;
  rotulo: string;
  href: string;
  /** Chave da grelha D.3; nulo = sempre visível. */
  chave: string | null;
};

export type ItemMontado = ItemMenu & { estado: "ativo" | "upgrade" };

/** Abas do painel da barbearia (D.3). */
export const MENU_GESTAO: readonly ItemMenu[] = [
  { id: "inicio", rotulo: m.inicio, href: "/app", chave: null },
  { id: "clientes", rotulo: m.clientes, href: "/app/clientes", chave: "gestao_clientes" },
  { id: "agenda", rotulo: m.agenda, href: "/app/agenda", chave: "agenda_basica" },
  { id: "equipa", rotulo: m.equipa, href: "/app/equipa", chave: "painel_profissional" },
  {
    id: "financeiro",
    rotulo: m.financeiro,
    href: "/app/financeiro",
    chave: "financeiro_objetivos",
  },
  {
    id: "comissoes",
    rotulo: m.comissoes,
    href: "/app/financeiro/acertos",
    chave: "comissoes_acertos",
  },
  { id: "loja", rotulo: m.loja, href: "/app/loja", chave: "loja_produtos" },
  { id: "relatorio", rotulo: m.relatorio, href: "/app/relatorio", chave: "relatorio_mensal" },
  { id: "sistema", rotulo: m.sistema, href: "/app/sistema", chave: null },
  { id: "plano", rotulo: m.plano, href: "/app/plano", chave: null },
];

/** Abas do painel do profissional (E.3). */
export function menuEquipa(profissionalId: string): ItemMenu[] {
  const base = `/app/equipa/${profissionalId}`;
  return [
    { id: "inicio", rotulo: m.inicio, href: base, chave: null },
    { id: "agenda", rotulo: m.agenda, href: `${base}/agenda`, chave: "agenda_basica" },
    { id: "clientes", rotulo: m.clientes, href: `${base}/clientes`, chave: "gestao_clientes" },
    { id: "metas", rotulo: m.metas, href: `${base}/metas`, chave: "metas_profissional" },
    { id: "comissoes", rotulo: m.comissoes, href: `${base}/acertos`, chave: "comissoes_acertos" },
    { id: "perfil", rotulo: m.perfil, href: `${base}/perfil`, chave: null },
  ];
}

/**
 * Filtra o menu pelas chaves ativas. Uma chave inativa sai, exceto as que a grelha marca
 * com `mostra_upgrade`, que ficam com o estado «upgrade».
 */
export function montarMenu(
  itens: readonly ItemMenu[],
  ativas: ReadonlySet<string>,
  comUpgrade: ReadonlySet<string>,
): ItemMontado[] {
  return itens.flatMap((item): ItemMontado[] => {
    if (item.chave === null || ativas.has(item.chave)) return [{ ...item, estado: "ativo" }];
    if (comUpgrade.has(item.chave)) return [{ ...item, estado: "upgrade" }];
    return [];
  });
}
